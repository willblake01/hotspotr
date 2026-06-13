import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { Drawer, MenuItem, Box, Typography, useTheme } from '@mui/material'
import { Footer } from '../components/Footer.js';
import { IndustryForm, LocationForm, DemographicForm } from '../components/Forms';
import { Logo2 } from '../components/Logo2.js';
import { Maps } from '../components/Maps.js';
import { SearchBar } from '../components/SearchBar.js';
import { Sidebar } from '../components/Sidebar.js';
import { SocialMedia } from '../components/SocialMedia.js';
import { sendTest, getCurrentUser } from '../utils/API';
import { setUser } from '../actions/actionCreators';

const DB_BG = 'https://res.cloudinary.com/willblake01/image/upload/v1538510014/hotspotr/dashboard-background.jpg';

export const Dashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const BROWN = theme.palette.secondary.main;
  const WHITE = theme.custom.white;

  const [open, setOpen] = useState(false);
  const [whichForm, setWhichForm] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [demographic, setDemographic] = useState('');
  const [placesResults, setPlacesResults] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState({ lat: 30.27, lng: -97.74 }); // Default to Austin, TX

  // Fetch current user on mount and redirect if not authenticated
  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        dispatch(setUser(user));
        setIsAuthenticated(true);
      } else {
        // User is not authenticated, redirect to landing page
        navigate('/', { replace: true });
      }
      setIsLoading(false);
    });
  }, [dispatch, navigate]);

  // Get user's current geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          // Keep default location (Austin, TX) if geolocation fails
        }
      );
    }
  }, []);

  const handleClose = () => setOpen(false);

  const handleToggleIndustry   = () => { setOpen(!open); setWhichForm('industry'); };
  const handleToggleLocation   = () => { setOpen(!open); setWhichForm('location'); };
  const handleToggleDemographic = () => { setOpen(!open); setWhichForm('demographic'); };
  const handleToggleHeatmap    = () => console.log('Yolo!');

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case 'industry':   setIndustry(value);    break;
      case 'location':   setLocation(value);    break;
      case 'demographic': setDemographic(value); break;
      default: break;
    }
  };

  const handleSubmit = () => {
    if (whichForm === 'industry') {
      sendTest({ keyword: industry })
          .then((res) => {
            const locations = res.data.results.map((i) => i.geometry.location);
            setPlacesResults((prev) => [...prev, locations]);
          })
          .catch((err) => console.error('sendTest error:', err));
      handleClose();
    }
  };

  const formSelection = () => {
    switch (whichForm) {
      case 'industry':
        return <IndustryForm handleInputChange={handleInputChange} handleSubmit={handleSubmit} />;
      case 'location':
        return <LocationForm handleInputChange={handleInputChange} handleSubmit={handleSubmit} />;
      case 'demographic':
        return <DemographicForm handleInputChange={handleInputChange} handleSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  // Don't render dashboard until authentication is verified
  if (isLoading) {
    return null;
  }

  // If not authenticated, don't render (navigation will happen in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
      // .dashboard-cont — full viewport with blurred background
      <Box sx={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>

        {/* .dashboard-cont:before — blurred gradient background */}
        <Box sx={{
          position: 'fixed',
          top: '-10px', left: '-10px', right: '-10px', bottom: '-10px',
          zIndex: 0,
          background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${DB_BG})`,
          backgroundSize: 'cover',
          filter: 'blur(5px)',
        }} />

        {/* .dashboard-grid-container */}
        <Box sx={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateRows: 'max-content',
          gridTemplateColumns: 'auto 1fr',
          height: '100%',
          width: '100%',
        }}>

          {/* .dashboard-grid-row — header spanning both columns */}
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
            opacity: 0.9,
          }}>
            {/* .dashboard-logo: width 4vw, border-radius 25px */}
            <Logo2 />
            {/* .main-title on dashboard */}
            <Typography variant='h1' sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }, color: WHITE, fontWeight: 'bold', ml: 2, mr: 4 }}>
              Hot Spotr
            </Typography>
            <SearchBar />
          </Box>

          {/* .dashboard-grid-column-1 — sidebar column */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            width: '100%',
          }}>
            <Sidebar
                handleToggleIndustry={handleToggleIndustry}
                handleToggleLocation={handleToggleLocation}
                handleToggleDemographic={handleToggleDemographic}
                handleToggleHeatmap={handleToggleHeatmap}
            />

            <Drawer open={open} onClose={handleClose}>
              <MenuItem onClick={handleClose}>CLOSE</MenuItem>
              {formSelection()}
            </Drawer>

            {/* .column-1-footer */}
            <Box sx={{ position: 'fixed', bottom: '12px' }}>
              <SocialMedia />
            </Box>
          </Box>

          {/* .dashboard-grid-column-2 — map column */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%',
            width: '100%',
          }}>
            {/* .dashboard-map: top offset to clear the header */}
            <Box sx={{ position: 'relative', top: '11vh', width: '100%' }}>
              <Maps mapClass='dashboard-map' center={userLocation} placesResults={placesResults} />
            </Box>

            {/* .column-2-footer */}
            <Box sx={{ display: 'flex', flexDirection: 'row', position: 'fixed', bottom: 0 }}>
              <Footer />
            </Box>
          </Box>

        </Box>
      </Box>
  );
};