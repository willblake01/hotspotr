import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const IndustryForm = ({ handleInputChange, handleSubmit }) => {
    const theme = useTheme();

    const ORANGE = theme.palette.primary.main;
    const BROWN = theme.palette.secondary.main;
    const WHITE = theme.custom.white;

    return (
        <Box sx={{ p: '20px', bgcolor: WHITE, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant='h6' sx={{ color: BROWN, fontWeight: 'bold' }}>
                What industry are you competing in?
            </Typography>
            <TextField
                type='text'
                name='industry'
                placeholder='Ex. Real Estate'
                onChange={handleInputChange}
                fullWidth
                size='small'
                variant='outlined'
            />
            <Button
                type='submit'
                variant='contained'
                onClick={handleSubmit}
                sx={{ borderRadius: '25px', textTransform: 'none', bgcolor: ORANGE }}
            >
                Submit
            </Button>
        </Box>
    );
};