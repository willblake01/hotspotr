import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Button, Divider, Stack, Typography, Tooltip, useTheme } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import GroupsIcon from '@mui/icons-material/Groups';
import TuneIcon from '@mui/icons-material/Tune';
import LogoutIcon from '@mui/icons-material/Logout';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { ProgressBar } from './ProgressBar';
import { userLogOut } from '../utils/API';
import { logout } from '../actions/actionCreators';

export const Sidebar = ({
                            handleToggleIndustry,
                            handleToggleRadius,
                            handleToggleDemographics,
                            handleToggleCompetitors,
                            showCompetitors,
                            competitorCount,
                            hasCompetitorData,
                        }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const ORANGE = theme.palette.primary.main;
    const BROWN  = theme.palette.secondary.main;
    const WHITE  = theme.custom.white;

    // Read filters from Redux to determine active state for each sidebar button
    const filters = useSelector((state) => state.filters);

    const navItems = [
        {
            label: 'TARGET INDUSTRY',
            icon: <BusinessIcon />,
            handler: 'handleToggleIndustry',
            active: !!filters.industry?.osmTag,
        },
        {
            label: 'LOCATION RADIUS',
            icon: <TuneIcon />,
            handler: 'handleToggleRadius',
            active: filters.radius !== 5, // active when changed from default
        },
        {
            label: 'TARGET DEMOGRAPHICS',
            icon: <GroupsIcon />,
            handler: 'handleToggleDemographics',
            active: Object.values(filters.demographics || {}).some((g) => g.length > 0),
        },
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

    // Active state styling — applied on top of sidebarLinkSx when a filter is configured
    // Matches the hover state so "active" reads as "currently pressed/selected"
    const activeSx = {
        bgcolor: WHITE,
        color: BROWN,
    };

    const [completed, setCompleted] = useState(0);
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const handlers = { handleToggleIndustry, handleToggleRadius, handleToggleDemographics };

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

    // Competitor button label — includes count when data exists
    const competitorLabel = showCompetitors
        ? `HIDE COMPETITORS${competitorCount ? ` (${competitorCount})` : ''}`
        : `SHOW COMPETITORS${competitorCount ? ` (${competitorCount})` : ''}`;

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
                    {navItems.map(({ label, icon, handler, active }) => (
                        <Button
                            key={label}
                            onClick={handlers[handler]}
                            startIcon={icon}
                            sx={{
                                ...sidebarLinkSx,
                                ...(active && activeSx),
                            }}
                        >
                            {label}
                        </Button>
                    ))}

                    {/* Show/Hide Competitors — dynamic label, count badge, disabled until data exists */}
                    <Tooltip title={!hasCompetitorData ? 'Select a Target Industry first' : ''}>
                        {/* span wrapper required — MUI Tooltip does not fire pointer events on disabled buttons */}
                        <span>
              <Button
                  onClick={handleToggleCompetitors}
                  disabled={!hasCompetitorData}
                  startIcon={showCompetitors ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  sx={{
                      ...sidebarLinkSx,
                      width: '100%',
                      ...(showCompetitors && activeSx),
                      ...(!hasCompetitorData && { opacity: 0.5 }),
                  }}
              >
                {competitorLabel}
              </Button>
            </span>
                    </Tooltip>

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