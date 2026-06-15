import React, { useCallback, useEffect, useRef, useState } from 'react';
import Map, { Source, Layer, Marker, Popup } from 'react-map-gl';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import 'mapbox-gl/dist/mapbox-gl.css';

// Converts placesResults array into a GeoJSON FeatureCollection for Mapbox heatmap
const toGeoJSON = (elements = []) => ({
  type: 'FeatureCollection',
  features: elements
      .map((el) => {
        // nodes have top-level lat/lon
        // ways have center.lat/center.lon
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (!lat || !lon) return null;
        return {
          type: 'Feature',
          properties: { weight: 1 },
          geometry: { type: 'Point', coordinates: [lon, lat] }
        };
      })
      .filter(Boolean)  // remove nulls
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
  placesResults = []
}) => {
  const theme = useTheme();
  const mapRef = useRef(null);
  const [popupInfo, setPopupInfo] = useState(null);

  const location = useSelector((state) => state.location);
  const { overpassData, censusData, loading, error } = useSelector((state) => state.heatmap);

  const handleMarkerEnter = useCallback((marker) => setPopupInfo(marker), []);
  const handleMarkerLeave = useCallback(() => setPopupInfo(null), []);

  const initialViewState = {
    latitude: location.lat ?? 30.27, // Default to Austin, TX if no location
    longitude: location.lng ?? -97.740,
    zoom: location.zoom ?? 11
  };

  const geoData = overpassData?.elements
      ? toGeoJSON(overpassData.elements)
      : { type: 'FeatureCollection', features: [] };

  const BROWN = theme.palette.secondary.main;

  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (!mapRef.current) return;

    if (location.bbox) {
      mapRef.current.fitBounds(
          [[location.bbox[0], location.bbox[1]], [location.bbox[2], location.bbox[3]]],
          { padding: 40, duration: 1500 }
      );
    } else {
      mapRef.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 13,
        duration: 1500,
      });
    }
  }, [location.lat, location.lng]);

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
              latitude={location.lat}
              longitude={location.lng}
              onMouseEnter={() => handleMarkerEnter({ lat: location.lat, lng: location.lng, text: 'Your Location' })}
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