import React from 'react';
import { Button, useTheme } from '@mui/material';

export const LargeButton = ({ buttonClick, buttonText }) => {
    const theme = useTheme();

    const ORANGE = theme.palette.primary.main;
    const BROWN = theme.palette.secondary.main;
    const WHITE = theme.custom.white;

    return (
        <Button
            onClick={buttonClick}
            variant='contained'
            sx={{
                px: '1rem',
                py: '0.5rem',
                fontSize: '1.25rem',
                fontWeight: 400,
                lineHeight: 1.5,
                borderRadius: '0.3rem',
                textAlign: 'center',
                verticalAlign: 'middle',
                textTransform: 'none',
                textDecoration: 'none',
                bgcolor: ORANGE,
                color: WHITE,
                border: '1px solid transparent',
                '&:hover': {bgcolor: BROWN, color: WHITE},
            }}
        >
            {buttonText}
        </Button>
    )
};