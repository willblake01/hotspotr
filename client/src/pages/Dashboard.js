import React, { useState } from 'react';
import { useTheme } from '@mui/material'
import { Sidebar } from '../components/Sidebar.js';
import { SocialMedia } from '../components/SocialMedia.js';
import { Maps } from '../components/Maps.js';
import { Drawer, MenuItem, Box, Typography } from '@mui/material';
import { IndustryForm, LocationForm, DemographicForm } from '../components/Forms';
import { sendTest } from '../utils/API';
import { Logo2 } from '../components/Logo2.js';
import { Footer } from '../components/Footer.js';

const DB_BG = 'https://res.cloudinary.com/willblake01/image/upload/v1538510014/hotspotr/dashboard-background.jpg';

export const Dashboard = () => {
  const theme = useTheme();

  const BROWN = theme.palette.secondary.main;
  const WHITE = theme.custom.white;

  const [open, setOpen] = useState(false);
  const [whichForm, setWhichForm] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [demographic, setDemographic] = useState('');
  const [placesResults, setPlacesResults] = useState([]);

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
            <Typography variant='h1' sx={{ fontSize: '6vw', color: WHITE, fontWeight: 'bold', ml: 2 }}>
              Hot Spotr
            </Typography>
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
              <Maps mapClass='dashboard-map' placesResults={placesResults} />
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