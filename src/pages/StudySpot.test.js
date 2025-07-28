import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudySpot from './StudySpot';

// Mock the react-leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children, position }) => (
    <div data-testid="marker" data-position={JSON.stringify(position)}>
      {children}
    </div>
  ),
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  useMap: () => ({
    setView: jest.fn(),
    invalidateSize: jest.fn(),
    _loaded: true,
    whenReady: jest.fn((cb) => cb()),
    removeLayer: jest.fn(),
    addTo: jest.fn(),
    hasLayer: jest.fn(() => false),
    removeControl: jest.fn()
  })
}));

// Mock leaflet
jest.mock('leaflet', () => ({
  heatLayer: jest.fn(() => ({
    addTo: jest.fn()
  })),
  latLng: jest.fn((lat, lng) => ({ lat, lng })),
  Routing: {
    control: jest.fn(() => ({
      addTo: jest.fn(),
      on: jest.fn(),
      _container: true
    })),
    osrmv1: jest.fn()
  }
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
});

// Mock fetch
global.fetch = jest.fn();

// Mock Layout component
jest.mock('../components/layout.js', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

const renderStudySpot = () => {
  return render(
    <BrowserRouter>
      <StudySpot />
    </BrowserRouter>
  );
};

describe('StudySpot Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  test('renders without crashing', () => {
    renderStudySpot();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  test('renders search input and location button', () => {
    renderStudySpot();
    
    expect(screen.getByPlaceholderText(/search a location/i)).toBeInTheDocument();
    expect(screen.getByText(/use my location/i)).toBeInTheDocument();
  });

  test('renders map container', async () => {
    renderStudySpot();
    
    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });
  });

  test('handles search input changes', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        {
          place_id: '1',
          lat: '3.1390',
          lon: '101.6869',
          display_name: 'Kuala Lumpur, Malaysia'
        }
      ])
    });

    renderStudySpot();
    
    const searchInput = screen.getByPlaceholderText(/search a location/i);
    fireEvent.change(searchInput, { target: { value: 'Kuala Lumpur' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('nominatim.openstreetmap.org'),
        expect.any(Object)
      );
    });
  });

  test('handles geolocation success', async () => {
    const mockPosition = {
      coords: {
        latitude: 3.1390,
        longitude: 101.6869,
        accuracy: 100
      }
    };

    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success(mockPosition);
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ elements: [] })
    });

    renderStudySpot();
    
    const locationButton = screen.getByText(/use my location/i);
    fireEvent.click(locationButton);

    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });
  });

  test('handles geolocation error gracefully', async () => {
    const mockError = { code: 1, message: 'Permission denied' };

    mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
      error(mockError);
    });

    renderStudySpot();
    
    const locationButton = screen.getByText(/use my location/i);
    fireEvent.click(locationButton);

    await waitFor(() => {
      expect(screen.getByText(/location error/i)).toBeInTheDocument();
    });
  });

  test('displays loading state when fetching location', async () => {
    mockGeolocation.getCurrentPosition.mockImplementationOnce(() => {
      // Don't call success or error to simulate loading
    });

    renderStudySpot();
    
    const locationButton = screen.getByText(/use my location/i);
    fireEvent.click(locationButton);

    await waitFor(() => {
      expect(screen.getByText(/getting location/i)).toBeInTheDocument();
    });
  });

  test('fetches nearby places on mount', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        elements: [
          {
            id: 1,
            lat: 3.1390,
            lon: 101.6869,
            tags: { name: 'Test Cafe', amenity: 'cafe' }
          }
        ]
      })
    });

    renderStudySpot();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://overpass-api.de/api/interpreter',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });

  test('handles API errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    renderStudySpot();

    await waitFor(() => {
      expect(screen.getByText(/places error/i)).toBeInTheDocument();
    });
  });

  test('displays retry button on error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    renderStudySpot();

    await waitFor(() => {
      const retryButton = screen.getByText(/retry/i);
      expect(retryButton).toBeInTheDocument();
    });
  });
});
