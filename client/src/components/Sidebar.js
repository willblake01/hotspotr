import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Button, Divider, Stack, Typography, useTheme } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import GroupsIcon from '@mui/icons-material/Groups';
import TuneIcon from '@mui/icons-material/Tune';
import LogoutIcon from '@mui/icons-material/Logout';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { ProgressBar } from './ProgressBar';
import { userLogOut } from '../utils/API';
import { logout } from '../actions/actionCreators';

export const Sidebar = ({ handleToggleIndustry, handleToggleRadius, handleToggleDemographics, handleToggleCompetitors }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const ORANGE = theme.palette.primary.main;
    const BROWN  = theme.palette.secondary.main;
    const WHITE  = theme.custom.white;

    const navItems = [
        { label: 'TARGET INDUSTRY', icon: <BusinessIcon />, handler: 'handleToggleIndustry' },
        { label: 'LOCATION RADIUS', icon: <TuneIcon />, handler: 'handleToggleRadius' },
        { label: 'TARGET DEMOGRAPHICS', icon: <GroupsIcon />, handler: 'handleToggleDemographics' },
        { label: 'SHOW COMPETITORS', icon: <StorefrontIcon />, handler: 'handleToggleCompetitors' },
    ];

    // Shared button styles — mirrors .sidebar-link and .sidebar-link:hover
    const sidebarLinkSx = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontSize: '13px',
        width: '100%',
        px: '20px',
        py: '10px',
        color: WHITE,
        border: `2px solid ${BROWN}`,
        borderRadius: '25px',
        mx: '4px',
        my: '4px',
        transition: 'all .2s ease-in-out',
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '0.05em',

        '& .MuiButton-startIcon svg': {
            color: BROWN,
            fontSize: '25px',
        },
        '&:hover': {
            color: BROWN,
            bgcolor: WHITE,
            transform: 'scale(1.1)',
            borderRadius: '25px',
        },
    };

  const [completed, setCompleted] = useState(0);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handlers = { handleToggleIndustry, handleToggleRadius, handleToggleDemographics, handleToggleCompetitors };

    const handleLogOut = () => {
        userLogOut()
            .then(() => {
                dispatch(logout());
                navigate('/', { replace: true });
            })
            .catch((err) => {
                console.error('Logout error:', err);
                navigate('/', { replace: true });
            });
    };

  // Get display name for welcome message
  const getDisplayName = () => {
    if (!user) return 'Guest';
    if (user.firstName) return user.firstName;
    if (user.email) return user.email;
    return 'Guest';
  };

  return (
    // .sidebar-wrapper
    <Box
      sx={{
        bgcolor: ORANGE,
        opacity: 0.9,
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* .welcome-space */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: '20px',
          borderBottom: '1px solid black',
          color: WHITE,
          height: '11vh',
          width: 'auto',
        }}
      >
        {/* .welcome-message */}
        <Box sx={{ textAlign: 'center', color: WHITE, width: '100%', '& > *': { my: '10px' } }}>
          <Typography variant='subtitle1' fontWeight='bold'>
            {`Welcome, ${getDisplayName()}`}
          </Typography>
          <Typography variant='body2'>Analysis Progress</Typography>
          <ProgressBar completed={completed} />
        </Box>
      </Box>

      {/* .menu-space */}
      <Box sx={{ p: '20px', color: WHITE }}>
        <Stack spacing={0}>
          {navItems.map(({ label, icon, handler }) => (
            <Button
              key={label}
              onClick={handlers[handler]}
              startIcon={icon}
              sx={sidebarLinkSx}
            >
              {label}
            </Button>
          ))}

          <Divider sx={{ borderColor: BROWN, my: 1 }} />

          <Button
            onClick={handleLogOut}
            startIcon={<LogoutIcon sx={{ color: BROWN, fontSize: '25px' }} />}
            sx={sidebarLinkSx}
          >
            LOGOUT
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};
