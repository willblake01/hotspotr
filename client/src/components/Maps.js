import React, { useRef, useCallback } from 'react';
import Map, { Source, Layer, Marker, Popup } from 'react-map-gl';
import { useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Converts the placesResults array from the old {lat, lng, weight} format
// into a GeoJSON FeatureCollection that Mapbox's heatmap layer expects.
const toGeoJSON = (positions = []) => ({
  type: 'FeatureCollection',
  features: positions.map(({ lat, lng, weight = 1 }) => ({
    type: 'Feature',
    properties: { weight },
    geometry: {
      type: 'Point',
      coordinates: [lng, lat]
    }
  }))
});

// Mapbox heatmap layer style — mirrors the gradient from the original component.
// See: https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#heatmap
const heatmapLayer = {
  id: 'heatmap-layer',
  type: 'heatmap',
  paint: {
    'heatmap-radius': 20,
    'heatmap-opacity': 0.7,
    // Weight by the `weight` property on each feature (defaults to 1)
    'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 1, 1],
    // Color ramp matches the original gradient (cyan → blue → red)
    'heatmap-color': [
      'interpolate', ['linear'], ['heatmap-density'],
      0,   'rgba(0,255,255,0)',
      0.1, 'rgba(0,255,255,1)',
      0.2, 'rgba(0,191,255,1)',
      0.3, 'rgba(0,127,255,1)',
      0.4, 'rgba(0,63,255,1)',
      0.5, 'rgba(0,0,255,1)',
      0.6, 'rgba(0,0,191,1)',
      0.7, 'rgba(0,0,127,1)',
      0.8, 'rgba(63,0,91,1)',
      0.9, 'rgba(127,0,63,1)',
      1.0, 'rgba(255,0,0,1)'
    ],
    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3]
  }
};

export const Maps = ({
                             mapClass,
                             center = { lat: 30.27, lng: -97.74 },
                             zoom = 11,
                             placesResults = []
                           }) => {
  const mapRef = useRef(null);
  const [popupInfo, setPopupInfo] = useState(null);

  // Initial viewport from center prop
  const initialViewState = {
    latitude: center.lat,
    longitude: center.lng,
    zoom
  };

  // Replaces onChildMouseEnter — fires when a marker is hovered
  const handleMarkerEnter = useCallback((marker) => {
    setPopupInfo(marker);
  }, []);

  // Replaces onChildMouseLeave
  const handleMarkerLeave = useCallback(() => {
    setPopupInfo(null);
  }, []);

  const geoData = toGeoJSON(placesResults[0] || []);

  return (
      <div className={mapClass} style={{ height: '60vh', width: '100%' }}>
        <Map
            ref={mapRef}
            mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
            initialViewState={initialViewState}
            style={{ width: '100%', height: '100%' }}
            mapStyle='mapbox://styles/mapbox/streets-v12'
        >
          {/* Heatmap layer — replaces the google-map-react heatmap prop */}
          {geoData.features.length > 0 && (
              <Source id='heatmap-source' type='geojson' data={geoData}>
                <Layer {...heatmapLayer} />
              </Source>
          )}

          {/* Example marker — equivalent to AnyReactComponent in the original */}
          <Marker
              latitude={center.lat}
              longitude={center.lng}
              onMouseEnter={() => handleMarkerEnter({ lat: center.lat, lng: center.lng, text: 'Austin, Texas' })}
              onMouseLeave={handleMarkerLeave}
          />

          {/* Popup shown on marker hover — replaces onChildMouseEnter tooltip pattern */}
          {popupInfo && (
              <Popup
                  latitude={popupInfo.lat}
                  longitude={popupInfo.lng}
                  closeButton={false}
                  anchor='top'
              >
                <div>{popupInfo.text}</div>
              </Popup>
          )}
        </Map>
      </div>
  );
};

Maps.defaultProps = {
  center: { lat: 30.27, lng: -97.74 },
  zoom: 11,
  placesResults: []
};