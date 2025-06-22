import React, { useState, useRef, useEffect } from "react";
import Layout from "../components/layout.js";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import "leaflet.heat";

export default function StudySpot() {
  const [position, setPosition] = useState(null); // will fallback after 4s
  const [markers, setMarkers] = useState([]);
  const [heatData, setHeatData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [routeTo, setRouteTo] = useState(null);

  const searchLocation = async (query) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
        {
          headers: {
            "User-Agent": "studyspot-app/1.0 (your-email@example.com)",
            "Accept-Language": "en"
          }
        }
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Search error:", err);
      alert("Failed to fetch location suggestions.");
    }
  };

  const selectSuggestion = (lat, lon) => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    setPosition([latNum, lonNum]);
    setSuggestions([]);
    fetchNearbyPlaces(latNum, lonNum);
  };

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        console.log("📍 Manual location fetch:", latitude, longitude, "accuracy:", accuracy);

        if (accuracy < 1000) {
          setPosition([latitude, longitude]);
          fetchNearbyPlaces(latitude, longitude);
        } else {
          alert(`⚠️ Location too inaccurate: ${accuracy} meters.`);
        }
      },
      (err) => {
        console.error("❌ Geolocation error:", err);
        alert(`Geolocation error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const fetchNearbyPlaces = async (lat, lon) => {
    const radius = 10000;
    const query = `
      [out:json];
      (
        node["amenity"="cafe"](around:${radius},${lat},${lon});
        node["amenity"="library"](around:${radius},${lat},${lon});
      );
      out body;
    `;
    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });
      const data = await res.json();
      const places = data.elements.map((place) => ({
        id: place.id,
        lat: place.lat,
        lon: place.lon,
        name: place.tags?.name || "Unnamed",
        type: place.tags?.amenity || "Unknown",
      }));
      setMarkers(places);
      setHeatData(places.map((p) => [p.lat, p.lon, 0.6]));
    } catch (err) {
      console.error("Nearby places error:", err);
    }
  };

  useEffect(() => {
    let watchId;
    const fallback = setTimeout(() => {
      if (!position) {
        console.warn("⚠️ No geolocation, using fallback location");
        setPosition([3.0738, 101.5036]); // UiTM Puncak Alam
      }
    }, 4000);

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          if (accuracy < 1000) {
            setPosition([latitude, longitude]);
            fetchNearbyPlaces(latitude, longitude);
            clearTimeout(fallback);
          }
        },
        (err) => {
          console.error("❌ Geolocation error:", err);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <Layout username="John Doe">
      <div style={{ padding: "1rem" }}>
        <input
          type="text"
          placeholder="Search a location (e.g. UiTM Shah Alam)"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.length > 2) searchLocation(e.target.value);
          }}
          style={{ width: "60%", padding: "8px", borderRadius: "6px" }}
        />
        <button onClick={useCurrentLocation} style={{ marginLeft: "10px" }}>
          📍 Use My Location
        </button>
        {suggestions.length > 0 && (
          <div style={{ background: "#fff", border: "1px solid #ccc", borderRadius: "6px", marginTop: "8px", maxWidth: "60%" }}>
            {suggestions.map((sug) => (
              <div
                key={sug.place_id}
                style={{ padding: "8px", cursor: "pointer" }}
                onClick={() => selectSuggestion(sug.lat, sug.lon)}
              >
                {sug.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {position && (
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: "85vh", width: "100%", borderRadius: "10px" }}
        >
          <MapUpdater center={position} />
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}><Popup>Your location</Popup></Marker>
          {markers.map((marker) => (
            <Marker key={marker.id} position={[marker.lat, marker.lon]}>
              <Popup>
                <b>{marker.name}</b><br />
                {marker.type}<br />
                <button
                  onClick={() => setRouteTo([marker.lat, marker.lon])}
                  style={{ marginTop: "5px", padding: "5px", color: "#fff", backgroundColor: "#007BFF", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  Route here
                </button>
              </Popup>
            </Marker>
          ))}
          {routeTo && <RoutePlanner from={position} to={routeTo} />}
          <LayerControl heatData={heatData} />
        </MapContainer>
      )}
    </Layout>
  );
}

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
    setTimeout(() => {
      map.invalidateSize(); // 🛠️ Force redraw
    }, 300);
  }, [map, center]);
  return null;
}

function LayerControl({ heatData }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !heatData.length) return;
    const heatLayer = L.heatLayer(heatData, { radius: 25 }).addTo(map);
    return () => map.removeLayer(heatLayer);
  }, [map, heatData]);
  return null;
}

function RoutePlanner({ from, to }) {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!map || !from || !to) return;

    try {
      if (routingRef.current && routingRef.current._container) {
        map.removeControl(routingRef.current);
      }
    } catch (err) {
      console.warn("❌ Failed to remove old route:", err);
    }

    routingRef.current = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      routeWhileDragging: false,
      lineOptions: {
        styles: [{ color: "#6c5dd3", weight: 4 }],
      },
      showAlternatives: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: () => null,
    }).addTo(map);

    return () => {
      try {
        if (routingRef.current && routingRef.current._container) {
          map.removeControl(routingRef.current);
        }
      } catch (err) {
        console.warn("❌ Failed to remove routing on unmount:", err);
      }
    };
  }, [map, from, to]);

  return null;
}
