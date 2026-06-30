import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Drawer, MenuItem, Box, Typography, useTheme } from '@mui/material';
import { Footer } from '../components/Footer.js';
import { IndustryForm } from '../components/IndustryForm.js';
import { RadiusForm } from '../components/RadiusForm.js';
import { DemographicsForm } from '../components/DemographicsForm.js';
import { Logo2 } from '../components/Logo2.js';
import { Maps } from '../components/Maps.js';
import { SearchBar } from '../components/SearchBar.js';
import { Sidebar } from '../components/Sidebar.js';
import { SocialMedia } from '../components/SocialMedia.js';
import { getSearchHistory, getSessionState, saveSessionState } from '../utils/API';
import { setHistory, setLocation } from '../store/locationSlice';
import { setAllFilters } from '../store/filtersSlice';
import { fetchLocationData } from '../store/heatmapSlice';

const DB_BG = 'https://res.cloudinary.com/willblake01/image/upload/v1538510014/hotspotr/dashboard-background.jpg';

export const Dashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const ORANGE = theme.palette.primary.main;
  const BROWN  = theme.palette.secondary.main;
  const WHITE  = theme.custom.white;

  const [open, setOpen] = useState(false);
  const [whichForm, setWhichForm] = useState('');
  const [showCompetitors, setShowCompetitors] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  const filters  = useSelector((state) => state.filters);
  const location = useSelector((state) => state.location);

  const handleClose = () => setOpen(false);

  const handleToggleIndustry     = () => { setOpen(!open); setWhichForm('industry'); };
  const handleToggleRadius       = () => { setOpen(!open); setWhichForm('location'); };
  const handleToggleDemographics = () => { setOpen(!open); setWhichForm('demographic'); };
  const handleToggleCompetitors  = () => setShowCompetitors(prev => !prev);

  const formSelection = () => {
    switch (whichForm) {
      case 'industry':    return <IndustryForm onSubmit={handleClose} />;
      case 'location':    return <RadiusForm onSubmit={handleClose} />;
      case 'demographic': return <DemographicsForm onSubmit={handleClose} />;
      default:            return null;
    }
  };

  const competitors = useSelector((state) => state.heatmap.competitors);
  const competitorCount = competitors?.elements?.filter(
      (el) => (el.lat ?? el.center?.lat) && (el.lon ?? el.center?.lon)
  ).length || 0;

  // Step 1 — rehydrate session state and search history on mount
  useEffect(() => {
    getSessionState()
        .then(({ filters: savedFilters, location: savedLocation }) => {
          if (savedFilters)  dispatch(setAllFilters(savedFilters));
          if (savedLocation) dispatch(setLocation({ ...savedLocation, query: 'restored' }));
        })
        .catch((err) => console.warn('Session state unavailable:', err.message))
        .finally(() => setSessionLoaded(true));

    getSearchHistory()
        .then((history) => {
          if (history?.length > 0) dispatch(setHistory(history));
        })
        .catch((err) => console.warn('Search history unavailable:', err.message));
  }, [dispatch]);

  // Step 2 — geolocate only if session has loaded and no saved location exists
  useEffect(() => {
    if (!sessionLoaded) return;
    if (location.placeName && location.placeName !== 'Your Location') return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
        (position) => {
          dispatch(setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            placeName: 'Your Location',
            query: 'current-location',
          }));
        },
        (err) => console.warn('Geolocation unavailable:', err.message),
        { timeout: 5000, maximumAge: 60000 }
    );
  }, [sessionLoaded]);

  // Step 3 — re-fire data fetch if industry and location were restored from session
  // Heatmap data is not persisted to Redis — re-fetch ensures fresh data on restore
  useEffect(() => {
    if (!sessionLoaded) return;
    if (!filters.industry?.osmTag) return;
    if (!location.lat || !location.lng) return;
    dispatch(fetchLocationData({ osmTag: filters.industry.osmTag }));
  }, [sessionLoaded]);

  // Step 4 — persist filters and location to Redis on every change
  // Excludes history from location to avoid duplication with searchHistory
  // Guard prevents overwriting Redis before session is loaded
  useEffect(() => {
    if (!sessionLoaded) return;
    const { history, ...locationToSave } = location;
    saveSessionState({ filters, location: locationToSave })
        .catch((err) => console.warn('Failed to save session state:', err.message));
  }, [filters, location]);

  return (
      <Box sx={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>

        {/* Blurred background */}
        <Box sx={{
          position: 'fixed',
          top: '-10px', left: '-10px', right: '-10px', bottom: '-10px',
          zIndex: 0,
          background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${DB_BG})`,
          backgroundSize: 'cover',
          filter: 'blur(5px)',
        }} />

        {/* Dashboard grid */}
        <Box sx={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateRows: 'max-content',
          gridTemplateColumns: 'auto 1fr',
          height: '100%',
          width: '100%',
        }}>

          {/* Header */}
          <Box sx={{
            gridColumnStart: 1,
            gridColumnEnd: 3,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            p: '20px',
            maxHeight: '120px',
            bgcolor: BROWN,
          }}>
            <Logo2 />
            <Typography
                variant='h1'
                sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }, color: WHITE, fontWeight: 'bold', ml: 2, mr: 4 }}
            >
              Hot Spotr
            </Typography>
            <SearchBar />
          </Box>

          {/* Sidebar column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', width: '100%' }}>
            <Sidebar
                handleToggleIndustry={handleToggleIndustry}
                handleToggleRadius={handleToggleRadius}
                handleToggleDemographics={handleToggleDemographics}
                handleToggleCompetitors={handleToggleCompetitors}
                showCompetitors={showCompetitors}
                competitorCount={competitorCount}
                hasCompetitorData={!!competitors}
            />

            <Drawer
                open={open}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    bgcolor: WHITE,
                    color: BROWN,
                    width: '374px',
                  }
                }}
            >
              <MenuItem
                  onClick={handleClose}
                  sx={{
                    color: ORANGE,
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: ORANGE, color: WHITE }
                  }}
              >
                CLOSE
              </MenuItem>
              {formSelection()}
            </Drawer>

            <Box sx={{ position: 'fixed', bottom: '12px' }}>
              <SocialMedia />
            </Box>
          </Box>

          {/* Map column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', width: '100%' }}>
            <Box sx={{ position: 'relative', top: '11vh', width: '100%' }}>
              <Maps showCompetitors={showCompetitors} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', position: 'fixed', bottom: 0 }}>
              <Footer />
            </Box>
          </Box>

        </Box>
      </Box>
  );
};