import React from 'react';
import { createRoot } from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Router } from './components/Router';

const theme = createTheme({
    palette: {
        primary: { main: '#DC623B' },
        secondary: { main: '#573525' },
    },
    custom: {
        black: '#000000',
        white: '#DAD6C7',
    }
});

const root = createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router />
        </ThemeProvider>
    </React.StrictMode>
);