import React from 'react';
import { Box, Button, TextField, Typography, useTheme } from '@mui/material';

// Shared panel — all three forms share the same structure
const FormPanel = ({ question, name, placeholder, handleInputChange, handleSubmit }) => {
    const theme = useTheme();

    const ORANGE = theme.palette.primary.main;
    const BROWN  = theme.palette.secondary.main;
    const WHITE  = theme.custom.white;

    // Shared styles — mirrors .field, .label, .input, .large-button
    const fieldSx = {
        p: '20px',
        bgcolor: WHITE,
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    };

    const submitButtonSx = {
        mt: 1,
        border: 'none',
        borderRadius: '25px',
        bgcolor: ORANGE,
        color: WHITE,
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '1rem',
        '&:hover': { bgcolor: BROWN, color: WHITE },
    };

    const inputSx = {
        '& .MuiOutlinedInput-root': { borderRadius: '0.3rem' },
        '& .MuiInputLabel-root': { color: BROWN },
        '& .MuiInputLabel-root.Mui-focused': { color: BROWN },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: BROWN,
        },
    };

    return (
        <Box sx={fieldSx}>
            {/* .label */}
            <Typography variant='h6' sx={{color: BROWN, fontWeight: 'bold'}}>
                {question}
            </Typography>

            {/* .input */}
            <TextField
                type='text'
                name={name}
                placeholder={placeholder}
                onChange={handleInputChange}
                fullWidth
                size='small'
                variant='outlined'
                sx={inputSx}
            />
            {/* .large-button */}
            <Button
                type='submit'
                variant='contained'
                onClick={handleSubmit}
                sx={submitButtonSx}
            >
                Submit
            </Button>
        </Box>
    )
};

export const IndustryForm = ({ handleInputChange, handleSubmit }) => (
    <FormPanel
        question='What industry are you competing in?'
        name='industry'
        placeholder='Ex. Real Estate'
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
    />
);

export const LocationForm = ({ handleInputChange, handleSubmit }) => (
    <FormPanel
        question='What location would you like to research?'
        name='location'
        placeholder='Ex. Travis Co'
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
    />
);

export const DemographicForm = ({ handleInputChange, handleSubmit }) => (
    <FormPanel
        question='What demographic would you like to research?'
        name='demographic'
        placeholder='Ex. Age'
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
    />
);

// Placeholder for future heatmap competition panel
export const CompetitionHeatmap = () => <Box />;