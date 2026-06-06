import React from 'react';
import { Box, Link, Typography, useTheme } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

export const Footer = () => {
    const theme = useTheme();

    const WHITE = theme.custom.white;

    return (
        // .footer-block
        <Box sx={{
            zIndex: 0,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%',
            position: 'fixed',
            bottom: '4px',
        }}>

            {/* .footer-link */}
            <Link
                href='https://github.com/willblake01/hotspotr'
                target='_blank'
                rel='noopener noreferrer'
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: WHITE,
                    '& > *': {mx: '4px'},
                }}
            >
                <GitHubIcon sx={{fontSize: '18px', color: WHITE}}/>
                <Typography variant='body2' sx={{color: WHITE}}>
                    Created by: Will Blake 2018 &copy;
                </Typography>
            </Link>
        </Box>
    )
};