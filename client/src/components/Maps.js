import React, { useCallback, useEffect, useRef, useState } from 'react';
import Map, { Source, Layer, Marker, Popup } from 'react-map-gl';
import { useSelector } from 'react-redux';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RoomIcon from '@mui/icons-material/Room';
import 'mapbox-gl/dist/mapbox-gl.css';

// Fill layer for H3 hexagonal opportunity cells
const opportunityLayer = {
  id: 'opportunity-layer',
  type: 'fill',
  paint: {
    'fill-color': [
      'interpolate', ['linear'], ['get', 'weight'],
      0,   'rgba(0,255,255,0.1)',
      0.3, 'rgba(0,127,255,0.4)',
      0.6, 'rgba(127,0,91,0.6)',
      0.8, 'rgba(191,0,31,0.7)',
      1.0, 'rgba(255,0,0,0.85)',
    ],
    'fill-outline-color': 'rgba(0,0,0,0.05)',
  }
};

export const Maps = ({ showCompetitors = false }) => {
  const theme = useTheme();
  const mapRef = useRef(null);
  const [hoveredCompetitor, setHoveredCompetitor] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const location = useSelector((state) => state.location);
  const filters = useSelector((state) => state.filters);

  const BROWN = theme.palette.secondary.main;

  const handleMarkerEnter = useCallback((marker) => setPopupInfo(marker), []);
  const handleMarkerLeave = useCallback(() => setPopupInfo(null), []);

  const initialViewState = {
    latitude:  location.lat  ?? 30.27,
    longitude: location.lng  ?? -97.74,
    zoom:      location.zoom ?? 11,
  };

  const geoJSON = useSelector((state) => state.heatmap.geoJSON);
  const competitors = useSelector((state) => state.heatmap.competitors);

  const geoData = geoJSON || { type: 'FeatureCollection', features: [] };

  const { loading } = useSelector((state) => state.heatmap);

  // Snap to restored location once map is loaded and location is available
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    if (!location.placeName || location.placeName === 'Your Location') return;

    if (location.bbox) {
      mapRef.current.fitBounds(
          [[location.bbox[0], location.bbox[1]], [location.bbox[2], location.bbox[3]]],
          { padding: 40, duration: 0 }
      );
    } else {
      mapRef.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 13,
        duration: 0,
      });
    }
  }, [mapLoaded, location.placeName]); // fires when map loads OR placeName is restored

// Animate to new location on user search
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    if (!location.placeName || location.placeName === 'Your Location') return;

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
      <Box sx={{ height: '60vh', width: '100%', position: 'relative' }}>
        {loading && (
            <Box sx={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0,0,0,0.3)',
              gap: 2,
            }}>
              <CircularProgress sx={{ color: 'white' }} size={48} />
              <Typography variant='body1' sx={{ color: 'white', fontWeight: 'bold' }}>
                Analyzing location data...
              </Typography>
            </Box>
        )}
        <Map
            ref={mapRef}
            onLoad={() => setMapLoaded(true)}
            mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
            initialViewState={initialViewState}
            style={{ width: '100%', height: '100%' }}
            mapStyle='mapbox://styles/mapbox/streets-v12'
        >
          {/* H3 hexagonal opportunity score layer */}
          {geoData.features.length > 0 && (
              <Source id='opportunity-source' type='geojson' data={geoData}>
                <Layer {...opportunityLayer} />
              </Source>
          )}

          {/* Competitor pins — toggled by Show Competitors button */}
          {showCompetitors && competitors?.map((el) => {
            const lat  = el.lat ?? el.center?.lat;
            const lon  = el.lon ?? el.center?.lon;
            const name = el.tags?.name || filters.industry.label;
            if (!lat || !lon) return null;
            return (
                <Marker key={el.id} latitude={lat} longitude={lon}>
                  <RoomIcon
                      sx={{ color: BROWN, fontSize: '28px', cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredCompetitor({ lat, lon, name })}
                      onMouseLeave={() => setHoveredCompetitor(null)}
                  />
                </Marker>
            );
          })}

          {/* Competitor hover popup */}
          {hoveredCompetitor && (
              <Popup
                  latitude={hoveredCompetitor.lat}
                  longitude={hoveredCompetitor.lon}
                  closeButton={false}
                  anchor='top'
              >
                <Typography variant='body2' sx={{ color: BROWN, fontWeight: 'bold' }}>
                  {hoveredCompetitor.name}
                </Typography>
              </Popup>
          )}

          {/* User location marker */}
          <Marker
              latitude={location.lat}
              longitude={location.lng}
              onMouseEnter={() => handleMarkerEnter({ lat: location.lat, lng: location.lng, text: 'Your Location' })}
              onMouseLeave={handleMarkerLeave}
          />

          {/* User location popup */}
          {popupInfo && (
              <Popup
                  latitude={popupInfo.lat}
                  longitude={popupInfo.lng}
                  closeButton={false}
                  anchor='top'
              >
                <Typography variant='body2' sx={{ color: BROWN }}>
                  {popupInfo.text}
                </Typography>
              </Popup>
          )}
        </Map>
      </Box>
  );
};