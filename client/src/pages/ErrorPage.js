import React from 'react';
import { Box, Typography } from '@mui/material';

const errorPageSx = {
  wrapper: {
    bgcolor: '#EFEFEF',
    color: '#2E2F30',
    textAlign: 'center',
    fontFamily: 'arial, sans-serif',
    m: 0,
    minHeight: '100vh',
  },
  dialog: {
    width: '95%',
    maxWidth: '33em',
    margin: '4em auto 0',
  },
  card: {
    border: '1px solid #CCC',
    borderRightColor: '#999',
    borderLeftColor: '#999',
    borderBottomColor: '#BBB',
    borderTop: '4px solid #B00100',
    borderTopLeftRadius: '9px',
    borderTopRightRadius: '9px',
    bgcolor: 'white',
    p: '7px 12% 0',
    boxShadow: '0 3px 8px rgba(50, 50, 50, 0.17)',
  },
  footer: {
    m: '0 0 1em',
    p: '1em',
    bgcolor: '#F7F7F7',
    border: '1px solid #CCC',
    borderRightColor: '#999',
    borderLeftColor: '#999',
    borderBottomColor: '#999',
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px',
    borderTopColor: '#DADADA',
    color: '#666',
    boxShadow: '0 3px 8px rgba(50, 50, 50, 0.17)',
  },
};

export const ErrorPage = ({ title, message }) => (
  <Box sx={errorPageSx.wrapper}>
    <Box sx={errorPageSx.dialog}>
      <Box sx={errorPageSx.card}>
        <Typography variant='h1' sx={{ fontSize: '100%', color: '#730E15', lineHeight: '1.5em', pb: 1 }}>
          {title}
        </Typography>
        {message && (
          <Typography sx={{ color: '#2E2F30', pb: 1 }}>
            {message}
          </Typography>
        )}
      </Box>
      <Box sx={errorPageSx.footer}>
        <Typography variant='body2'>
          If you are the application owner check the logs for more information.
        </Typography>
      </Box>
    </Box>
  </Box>
);

// Convenience exports so existing imports don't need to change
export const Error404 = () => (
  <ErrorPage
    title="The page you were looking for doesn't exist."
    message="You may have mistyped the address or the page may have moved."
  />
);

export const Error422 = () => (
  <ErrorPage
    title="The change you wanted was rejected."
    message="Maybe you tried to change something you didn't have access to."
  />
);

export const Error500 = () => (
  <ErrorPage
    title="We're sorry, but something went wrong."
  />
);
