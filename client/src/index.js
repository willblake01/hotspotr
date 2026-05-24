import React from 'react';
import { createRoot } from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './styles/css/index.css';
import { Router } from './components/Router';

// ThemeProvider belongs here at the app root — all MUI components in the
// tree inherit the theme automatically without needing individual ThemeProviders
const theme = createTheme();

const root = createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <Router />
        </ThemeProvider>
    </React.StrictMode>
);