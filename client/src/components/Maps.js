import React, { useRef, useCallback, useState } from 'react';
import Map, { Source, Layer, Marker, Popup } from 'react-map-gl';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import 'mapbox-gl/dist/mapbox-gl.css';

// Converts placesResults array into a GeoJSON FeatureCollection for Mapbox heatmap
const toGeoJSON = (positions = []) => ({
  type: 'FeatureCollection',
  features: positions.map(({ lat, lng, weight = 1 }) => ({
    type: 'Feature',
    properties: { weight },
    geometry: { type: 'Point', coordinates: [lng, lat] }
  }))
});

// Mapbox heatmap layer — cyan → blue → red gradient
const heatmapLayer = {
  id: 'heatmap-layer',
  type: 'heatmap',
  paint: {
    'heatmap-radius': 20,
    'heatmap-opacity': 0.7,
    'heatmap-weight': ['interpolate', ['linear'], ['get', 'weight'], 0, 0, 1, 1],
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
  center = { lat: 30.27, lng: -97.74 },
  zoom = 11,
  placesResults = []
}) => {
  const theme = useTheme();
  const mapRef = useRef(null);
  const [popupInfo, setPopupInfo] = useState(null);

  const handleMarkerEnter = useCallback((marker) => setPopupInfo(marker), []);
  const handleMarkerLeave = useCallback(() => setPopupInfo(null), []);

  const initialViewState = { latitude: center.lat, longitude: center.lng, zoom };

  const geoData = toGeoJSON(placesResults[0] || []);

  const BROWN = theme.palette.secondary.main;

  return (
      // mapClass and inline style replaced with MUI Box sx
      <Box sx={{ height: '60vh', width: '100%' }}>
        <Map
            ref={mapRef}
            mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
            initialViewState={initialViewState}
            style={{ width: '100%', height: '100%' }}
            mapStyle='mapbox://styles/mapbox/streets-v12'
        >
          {geoData.features.length > 0 && (
              <Source id='heatmap-source' type='geojson' data={geoData}>
                <Layer {...heatmapLayer} />
              </Source>
          )}

          <Marker
              latitude={center.lat}
              longitude={center.lng}
              onMouseEnter={() => handleMarkerEnter({ lat: center.lat, lng: center.lng, text: 'Austin, Texas' })}
              onMouseLeave={handleMarkerLeave}
          />

          {popupInfo && (
              <Popup
                  latitude={popupInfo.lat}
                  longitude={popupInfo.lng}
                  closeButton={false}
                  anchor='top'
              >
                {/* Popup text styled with MUI Typography */}
                <Typography variant='body2' sx={{ color: BROWN }}>
                  {popupInfo.text}
                </Typography>
              </Popup>
          )}
        </Map>
      </Box>
  );
};