import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
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
import { getSearchHistory } from '../utils/API';
import { setHistory, setLocation } from '../store/locationSlice';

// IndustryForm, RadiusForm, DemographicsForm now manage their own state
// via Redux filtersSlice — no handleInputChange or handleSubmit needed here

const DB_BG = 'https://res.cloudinary.com/willblake01/image/upload/v1538510014/hotspotr/dashboard-background.jpg';

export const Dashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const ORANGE = theme.palette.primary.main;
  const BROWN = theme.palette.secondary.main;
  const WHITE = theme.custom.white;

  const [open, setOpen] = useState(false);
  const [whichForm, setWhichForm] = useState('');

  // Geolocation — center map on user's current position on mount
  useEffect(() => {
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
  }, [dispatch]);

  // Rehydrate search history from Redis session on mount
  useEffect(() => {
    getSearchHistory().then((history) => {
      if (history?.length > 0) dispatch(setHistory(history));
    }).catch((err) => console.warn('Search history unavailable:', err.message));
  }, [dispatch]);

  const handleClose = () => setOpen(false);

  const handleToggleIndustry    = () => { setOpen(!open); setWhichForm('industry'); };
  const handleToggleLocation    = () => { setOpen(!open); setWhichForm('location'); };
  const handleToggleDemographic = () => { setOpen(!open); setWhichForm('demographic'); };
  const handleToggleHeatmap     = () => console.log('Yolo!');

  // Each form is self-contained — dispatches to filtersSlice directly
  // onSubmit is passed so forms can close the Drawer after submitting
  const formSelection = () => {
    switch (whichForm) {
      case 'industry':
        return <IndustryForm onSubmit={handleClose} />;
      case 'location':
        return <RadiusForm onSubmit={handleClose} />;
      case 'demographic':
        return <DemographicsForm onSubmit={handleClose} />;
      default:
        return null;
    }
  };

  return (
      <Box sx={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}>

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
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            width: '100%'
          }}>
            <Sidebar
                handleToggleIndustry={handleToggleIndustry}
                handleToggleLocation={handleToggleLocation}
                handleToggleDemographic={handleToggleDemographic}
                handleToggleHeatmap={handleToggleHeatmap}
            />

            <Drawer
                open={open}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    bgcolor: WHITE,
                    color: BROWN,
                    width: '374px',  // match sidebar width
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

            <Box sx={{
              position: 'fixed',
              bottom: '12px'
            }}>
              <SocialMedia />
            </Box>
          </Box>

          {/* Map column */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            width: '100%'
          }}>
            <Box sx={{
              position: 'relative',
              top: '11vh',
              width: '100%'
            }}>
              <Maps />
            </Box>
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              position: 'fixed',
              bottom: 0
            }}>
              <Footer />
            </Box>
          </Box>

        </Box>
      </Box>
  );
};