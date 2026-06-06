import React, { useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Logo } from '../components/Logo.js';
import { LargeButton } from '../components/LargeButton.js';
import { AuthModal } from '../components/AuthModal.js';
import { Footer } from '../components/Footer.js';
import { SocialMedia } from '../components/SocialMedia.js';

const BG_IMAGE = 'https://res.cloudinary.com/willblake01/image/upload/v1538510016/hotspotr/landing-background.jpg';

export const Landing = () => {
  const theme = useTheme();

  const WHITE = theme.custom.white;

  const [activeModal, setActiveModal] = useState(false);
  const [clickedButton, setClickedButton] = useState('');

  const toggleModal  = () => setActiveModal(prev => !prev);
  const toggleSignUp = () => { setActiveModal(true); setClickedButton('Sign Up'); };
  const toggleLogIn  = () => { setActiveModal(true); setClickedButton('Login'); };

  return (
      // .landing-cont — full viewport container with blurred background via ::before pseudo
      // MUI doesn't support ::before directly in sx, so we use a real child Box as the backdrop
      <Box sx={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>

        {/* Blurred background — replicates .landing-cont:before */}
        <Box sx={{
          position: 'fixed',
          top: '-10px',
          left: '-10px',
          right: '-10px',
          bottom: '-10px',
          zIndex: 0,
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(5px)',
        }} />

        {/* .landing-grid-container — 2-col grid with footer row */}
        <Box sx={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gridTemplateRows: 'auto 80px',
          width: '100%',
          height: '100%',
        }}>

          {/* .landing-grid-column-1 */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>

            {/* .landing-content-grid-container — logo + text side by side */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'auto auto',
              columnGap: '20px',
            }}>

              {/* .content-grid-column-1 — logo */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <Logo logoClass='logo-image' />
              </Box>

              {/* .content-grid-column-2 — title, subtitle, buttons */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                '& > *': { m: 0, p: '4px' },
              }}>
                {/* .main-title */}
                <Typography
                    variant='h1'
                    sx={{ fontSize: '6vw', color: WHITE, fontWeight: 'bold', lineHeight: 1.1, mb: '8px' }}
                >
                  HotSpotr
                </Typography>

                {/* .sub-title */}
                <Typography
                    variant='body1'
                    sx={{ fontSize: '1.5vw', color: WHITE }}
                >
                  Where should you open?
                </Typography>

                {/* .sub-subtitle */}
                <Typography
                    variant='body2'
                    sx={{ fontSize: '1.2vw', color: WHITE, maxWidth: '400px' }}
                >
                  Heatmap-powered insights on demographics, income, and competition for any US city.
                </Typography>

                {/* .button-group */}
                <Box sx={{
                  display: 'flex',
                  width: '100%',
                  gap: '10px'
                }}>
                  <LargeButton
                      buttonClick={toggleSignUp}
                      buttonText='Sign Up'
                  />
                  <LargeButton
                      buttonClick={toggleLogIn}
                      buttonText='Login'
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* .landing-grid-column-2 — empty right column */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }} />

          <AuthModal
              activeModal={activeModal}
              clickedButton={clickedButton}
              toggleModal={toggleModal}
          />

          {/* .landing-grid-row — footer spanning both columns */}
          <Box sx={{
            gridColumnStart: 1,
            gridColumnEnd: 3,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
            position: 'relative',
          }}>
            {/* .landing-social-media */}
            <Box sx={{
              position: 'absolute',
              left: '12px',
              zIndex: 99,
              color: WHITE,
              '& > *': { m: '4px' },
            }}>
              <SocialMedia />
            </Box>
            <Footer />
          </Box>

        </Box>
      </Box>
  );
};