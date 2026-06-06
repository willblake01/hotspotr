import React from 'react';
import { Box } from '@mui/material';

export const Logo = ({ size = '10vw' }) => (
    <Box
        component='img'
        src='https://res.cloudinary.com/willblake01/image/upload/v1538510016/hotspotr/logo.png'
        alt='Hot Spotr'
        sx={{
            height: 'auto',
            width: size,
            borderRadius: '25px',
        }}
    />
);