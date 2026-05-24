import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar.js';
import { SocialMedia } from '../components/SocialMedia.js';
import { Maps } from '../components/Maps.js';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Drawer, MenuItem } from '@mui/material';
import { IndustryForm, LocationForm, DemographicForm } from '../components/Forms';
import { sendTest } from '../utils/API';
import { Logo2 } from '../components/Logo2.js';
import { Footer } from '../components/Footer.js';

// ThemeProvider requires a theme object — without it MUI v5 throws the
// $$material error. Create a default theme (customize as needed).
const theme = createTheme();

export const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const [whichForm, setWhichForm] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [demographic, setDemographic] = useState('');
  const [placesResults, setPlacesResults] = useState([]);

  const handleClose = () => setOpen(false);

  const handleToggleIndustry = () => {
    setOpen(!open);
    setWhichForm('industry');
  };

  const handleToggleLocation = () => {
    setOpen(!open);
    setWhichForm('location');
  };

  const handleToggleDemographic = () => {
    setOpen(!open);
    setWhichForm('demographic');
  };

  const handleToggleHeatmap = () => {
    console.log('Yolo!');
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case 'industry':
        setIndustry(value);
        break;
      case 'location':
        setLocation(value);
        break;
      case 'demographic':
        setDemographic(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = () => {
    if (whichForm === 'industry') {
      sendTest({ keyword: industry })
          .then((res) => {
            const locations = res.data.results.map((i) => i.geometry.location);
            // BUG FIX: original used placesResults.push() which mutates state directly.
            // Use setPlacesResults to trigger a re-render.
            setPlacesResults((prev) => [...prev, locations]);
          })
          // BUG FIX: original used a second .then() as an error handler, which only
          // catches errors from the first .then(), not the API call itself.
          .catch((err) => console.error('sendTest error:', err));
      handleClose();
    }
  };

  const formSelection = () => {
    switch (whichForm) {
      case 'industry':
        return (
            <IndustryForm
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
            />
        );
      case 'location':
        return (
            <LocationForm
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
            />
        );
      case 'demographic':
        return (
            <DemographicForm
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
            />
        );
      default:
        return null;
    }
  };

  return (
      <div className='dashboard-cont'>
        <div className='dashboard-grid-container'>
          <div className='dashboard-grid-row'>
            <Logo2 logo2Class='dashboard-logo' />
            <h1 className='main-title'>Hot Spotr</h1>
          </div>
          <div className='dashboard-grid-column-1'>
            <Sidebar
                handleToggleIndustry={handleToggleIndustry}
                handleToggleLocation={handleToggleLocation}
                handleToggleDemographic={handleToggleDemographic}
                handleToggleHeatmap={handleToggleHeatmap}
            />
            <ThemeProvider theme={theme}>
              <Drawer
                  open={open}
                  // BUG FIX: onRequestChange was MUI v4 API and used setState (class pattern).
                  // v5 uses onClose, and we use the setOpen hook.
                  onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>CLOSE</MenuItem>
                {formSelection()}
              </Drawer>
            </ThemeProvider>
            <div className='column-1-footer'>
              <SocialMedia socialClass='dashboard-social-media' />
            </div>
          </div>
          <div className='dashboard-grid-column-2'>
            <Maps mapClass='dashboard-map' placesResults={placesResults} />
            <div className='column-2-footer'>
              <Footer footerClass='footer-block' />
            </div>
          </div>
        </div>
      </div>
  );
};