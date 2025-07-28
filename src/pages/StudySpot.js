// ✅ StudySpot.js
import React, { useState, useRef, useEffect } from "react";
import Layout from "../components/layout.js";
import { useNavigate } from "react-router-dom";
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
import "./StudySpot.css";

export default function StudySpot() {
  const [position, setPosition] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [heatData, setHeatData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [routeTo, setRouteTo] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const navigate = useNavigate();

  useEffect(() => setIsClient(true), []);

  const searchLocation = async (query) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
        {
          headers: {
            "User-Agent": "studyspot-app/1.0",
            "Accept-Language": "en"
          }
        }
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Search error:", err);
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
        console.log(`📍 Location accuracy: ${accuracy} meters`);
        // Use progressive accuracy thresholds
        if (accuracy < 100) {
          setPosition([latitude, longitude]);
          fetchNearbyPlaces(latitude, longitude);
        } else if (accuracy < 500) {
          setPosition([latitude, longitude]);
          fetchNearbyPlaces(latitude, longitude);
          console.log("⚠️ Using moderate accuracy location");
        } else if (accuracy < 1000) {
          setPosition([latitude, longitude]);
          fetchNearbyPlaces(latitude, longitude);
          console.log("⚠️ Using low accuracy location");
        } else {
          // Still use the location but warn user
          setPosition([latitude, longitude]);
          fetchNearbyPlaces(latitude, longitude);
          console.log(`⚠️ Location accuracy is ${accuracy} meters - results may be less precise`);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        // Fallback to default location (Kuala Lumpur)
        console.log("📍 Using fallback location: Kuala Lumpur");
        setPosition([3.0738, 101.5036]);
        fetchNearbyPlaces(3.0738, 101.5036);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 30000
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
        node["amenity"="restaurant"](around:${radius},${lat},${lon});
        node["amenity"="fast_food"](around:${radius},${lat},${lon});
        node["leisure"="park"](around:${radius},${lat},${lon});
      );
      out body;
    `;
    try {
      console.log(`🔍 Fetching nearby places for coordinates: ${lat}, ${lon}`);
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
        headers: {
          'Content-Type': 'text/plain'
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log(`📍 Found ${data.elements?.length || 0} places`);

      const places = data.elements?.map((place) => ({
        id: place.id,
        lat: place.lat,
        lon: place.lon,
        name: place.tags?.name || `${place.tags?.amenity || 'Unknown'} Place`,
        type: place.tags?.amenity || place.tags?.leisure || "Unknown",
      })) || [];

      // Add some fallback markers if no places found
      if (places.length === 0) {
        console.log("📍 No places found, adding sample markers");
        const sampleMarkers = [
          {
            id: 'sample-1',
            lat: lat + 0.001,
            lon: lon + 0.001,
            name: 'Sample Cafe',
            type: 'cafe'
          },
          {
            id: 'sample-2',
            lat: lat - 0.001,
            lon: lon - 0.001,
            name: 'Sample Library',
            type: 'library'
          }
        ];
        setMarkers(sampleMarkers);
        setHeatData(sampleMarkers.map((p) => [p.lat, p.lon, 0.6]));
      } else {
        setMarkers(places);
        setHeatData(places.map((p) => [p.lat, p.lon, 0.6]));
      }
    } catch (err) {
      console.error("❌ Nearby places error:", err);
      // Add fallback markers even on error
      const fallbackMarkers = [
        {
          id: 'fallback-1',
          lat: lat + 0.002,
          lon: lon + 0.002,
          name: 'Local Cafe',
          type: 'cafe'
        },
        {
          id: 'fallback-2',
          lat: lat - 0.002,
          lon: lon - 0.002,
          name: 'Study Library',
          type: 'library'
        }
      ];
      setMarkers(fallbackMarkers);
      setHeatData(fallbackMarkers.map((p) => [p.lat, p.lon, 0.6]));
    }
  };

  useEffect(() => {
    let watchId;
    let fallbackExecuted = false;

    const fallback = setTimeout(() => {
      if (!position && !fallbackExecuted) {
        fallbackExecuted = true;
        console.log("📍 Using fallback location: Kuala Lumpur");
        setPosition([3.0738, 101.5036]);
        fetchNearbyPlaces(3.0738, 101.5036);
      }
    }, 6000);

    if ("geolocation" in navigator) {
      // Try to get current position first
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          console.log(`📍 Initial location accuracy: ${accuracy} meters`);
          if (!fallbackExecuted) {
            setPosition([latitude, longitude]);
            fetchNearbyPlaces(latitude, longitude);
            clearTimeout(fallback);
            fallbackExecuted = true;
          }
        },
        (err) => {
          console.error("❌ Initial geolocation error:", err);
          // Don't set fallback here, let the timeout handle it
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );

      // Also watch for position changes
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          if (accuracy < 1000 && !fallbackExecuted) {
            setPosition([latitude, longitude]);
            fetchNearbyPlaces(latitude, longitude);
            clearTimeout(fallback);
            fallbackExecuted = true;
          }
        },
        (err) => console.error("❌ Watch geolocation error:", err),
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 60000
        }
      );
    } else {
      // Geolocation not supported
      console.log("📍 Geolocation not supported, using fallback location");
      setPosition([3.0738, 101.5036]);
      fetchNearbyPlaces(3.0738, 101.5036);
      clearTimeout(fallback);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <Layout username="John Doe">
      <div className="study-spot-page">
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search a location"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.length > 2) searchLocation(e.target.value);
            }}
            className="search-input"
          />
          <button
            onClick={useCurrentLocation}
            className="location-btn"
            aria-label="Use my current location to find nearby study spots"
            title="Get your current location and show nearby study spots"
          >
            📍 Use My Location
          </button>
          {suggestions.length > 0 && (
            <div className="suggestions-container">
              {suggestions.map((sug) => (
                <div
                  key={sug.place_id}
                  className="suggestion-item"
                  onClick={() => selectSuggestion(sug.lat, sug.lon)}
                >
                  {sug.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="map-container">
          {isClient && position ? (
            <MapContainer
              center={position}
              zoom={15}
            >
              <MapUpdater center={position} />
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}>
                <Popup>Your location</Popup>
              </Marker>
              {markers.map((marker) => (
                <Marker key={marker.id} position={[marker.lat, marker.lon]}>
                  <Popup>
                    <div className="popup-content">
                      <div className="popup-title">{marker.name}</div>
                      <div className="popup-address">{marker.type}</div>
                      <div className="popup-actions">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            console.log(`🗺️ Setting route to: ${marker.name}`);
                            setRouteTo([marker.lat, marker.lon]);
                          }}
                          className="popup-btn route"
                          type="button"
                          aria-label={`Get directions to ${marker.name}`}
                          title={`Show route and navigation to ${marker.name}`}
                        >
                          🗺️ Route here
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            console.log(`📝 Navigating to reviews for: ${marker.name}`);
                            navigate(`/study-spot-reviews/${marker.id}`, {
                              state: {
                                spotId: marker.id,
                                spotName: marker.name,
                                spotLocation: { lat: marker.lat, lon: marker.lon }
                              }
                            });
                          }}
                          className="popup-btn review"
                          type="button"
                          aria-label={`View reviews and navigate to ${marker.name}`}
                          title={`Read reviews, ratings, and get detailed navigation to ${marker.name}`}
                        >
                          📝 Review & Navigate
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {routeTo && <RoutePlanner from={position} to={routeTo} />}
              <LayerControl heatData={heatData} />
            </MapContainer>
          ) : (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <div className="loading-text">Loading map...</div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !center) return;

    map.setView(center);

    if (map._loaded) {
      map.invalidateSize();
    } else {
      map.whenReady(() => map.invalidateSize());
    }
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
      lineOptions: { styles: [{ color: "#6c5dd3", weight: 4 }] },
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
