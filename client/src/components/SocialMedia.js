
import React from 'react';
import { Box, Link, useTheme } from '@mui/material';

const socialLinks = [
    { href: 'https://www.facebook.com',  src: 'https://res.cloudinary.com/willblake01/image/upload/v1538510014/hotspotr/facebook-brown.svg',  alt: 'facebook'  },
    { href: 'https://www.instagram.com', src: 'https://res.cloudinary.com/willblake01/image/upload/v1538510014/hotspotr/instagram-brown.svg', alt: 'instagram' },
    { href: 'https://www.twitter.com',   src: 'https://res.cloudinary.com/willblake01/image/upload/v1538510016/hotspotr/twitter-brown.svg',   alt: 'twitter'   }
];

export const SocialMedia = () => {
    const theme = useTheme();

    const WHITE = theme.custom.white;

    // .social-icon styles
    const iconSx = {
        display: 'block',
        textAlign: 'center',
        borderRadius: '15px',
        p: '5px',
        height: '42px',
        width: '42px',
        bgcolor: WHITE,
    };

    return (
        // .landing-social-media / .dashboard-social-media — positioning handled by parent
        <Box sx={{
            left: '12px',
            zIndex: 99,
            color: WHITE,
            display: 'flex',
            gap: '10px',
        }}>
            {socialLinks.map(({href, src, alt}) => (
                <Link key={alt} href={href} target='_blank' rel='noopener noreferrer'>
                    <Box
                        component='img'
                        src={src}
                        alt={alt}
                        sx={iconSx}
                    />
                </Link>
            ))}
        </Box>
    )
};