import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { userSignUp, userLogIn } from '../utils/API';
import { signup, login } from '../actions/actionCreators';
import {
    Alert,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    useTheme,
    Button,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const AuthModal = ({ clickedButton, activeModal, toggleModal }) => {
    const theme = useTheme();

    const ORANGE = theme.palette.primary.main;
    const BROWN  = theme.palette.secondary.main;
    const WHITE  = theme.custom.white;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState('');
    const dispatch = useDispatch();

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'email') setEmail(value);
        if (name === 'password') setPassword(value);
        if (name === 'firstName') setFirstName(value);
        if (name === 'lastName') setLastName(value);
    };

    const handleSignup = async () => {
        const res = await userSignUp({ firstName, lastName, email, password });
        dispatch(signup(res));
        if (res) setIsLoggedIn(true);
    };

    const handleLogin = async () => {
        const res = await userLogIn({ email, password });
        dispatch(login(res));
        if (res) setIsLoggedIn(true);
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!email || !password) {
          setError('Please enter a valid email and password.');
          return;
        }

        try {
          if (clickedButton === 'Sign Up') {
            await handleSignup();
          } else if (clickedButton === 'Login') {
            await handleLogin();
          }
          setEmail('');
          setPassword('');
          setFirstName('');
          setLastName('');
          toggleModal();
        } catch (err) {
          console.error(`${clickedButton} error:`, err);
          // Show the specific error message from the server if available
          const errorMessage = err.response?.data?.message || err.response?.data?.error;
          setError(
              errorMessage || (clickedButton === 'Sign Up'
                  ? 'Signup failed. Please try again.'
                  : 'Login failed. Please check your credentials.')
          );
        }
    };

    if (isLoggedIn) {
        return <Navigate to='/dashboard' replace />;
    }

    return (
      // Dialog replaces .modal + .modal-background — handles backdrop and open state
      <Dialog
          open={activeModal}
          onClose={toggleModal}
          maxWidth='xs'
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: ORANGE,
              color: WHITE,
              borderRadius: '12px',
              p: 1,
            }
          }}
      >
        <DialogTitle sx={{ color: WHITE, fontWeight: 'bold', pr: 6 }}>
          {clickedButton}
          {/* IconButton replaces .modal-close.is-large */}
          <IconButton
              onClick={toggleModal}
              aria-label='close'
              sx={{ position: 'absolute', right: 12, top: 12, color: WHITE }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Box component='form' onSubmit={handleFormSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Inline Alert replaces alert() */}
            {error && (
                <Alert severity='error' onClose={() => setError('')}>
                  {error}
                </Alert>
            )}

            {/* First Name and Last Name fields - only show for Sign Up (optional) */}
            {clickedButton === 'Sign Up' && (
              <>
                <TextField
                    label='First Name'
                    type='text'
                    name='firstName'
                    value={firstName}
                    onChange={handleInputChange}
                    fullWidth
                    variant='outlined'
                    size='small'
                    sx={{
                        '& .MuiOutlinedInput-root': { bgcolor: WHITE, borderRadius: '8px' },
                        '& .MuiInputLabel-root': { color: BROWN },
                        '& .MuiInputLabel-root.Mui-focused': { color: BROWN },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: BROWN,
                        },
                    }}
                />

                <TextField
                    label='Last Name'
                    type='text'
                    name='lastName'
                    value={lastName}
                    onChange={handleInputChange}
                    fullWidth
                    variant='outlined'
                    size='small'
                    sx={{
                        '& .MuiOutlinedInput-root': { bgcolor: WHITE, borderRadius: '8px' },
                        '& .MuiInputLabel-root': { color: BROWN },
                        '& .MuiInputLabel-root.Mui-focused': { color: BROWN },
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: BROWN,
                        },
                    }}
                />
              </>
            )}

            {/* TextField replaces <label> + <input> */}
            <TextField
                label='Email'
                type='text'
                name='email'
                value={email}
                onChange={handleInputChange}
                fullWidth
                variant='outlined'
                size='small'
                sx={{
                    '& .MuiOutlinedInput-root': { bgcolor: WHITE, borderRadius: '8px' },
                    '& .MuiInputLabel-root': { color: BROWN },
                    '& .MuiInputLabel-root.Mui-focused': { color: BROWN },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: BROWN,
                    },
                }}
            />

            <TextField
                label='Password'
                type='password'
                name='password'
                value={password}
                onChange={handleInputChange}
                fullWidth
                variant='outlined'
                size='small'
                sx={{
                    '& .MuiOutlinedInput-root': { bgcolor: WHITE, borderRadius: '8px' },
                    '& .MuiInputLabel-root': { color: BROWN },
                    '& .MuiInputLabel-root.Mui-focused': { color: BROWN },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: BROWN,
                    },
                }}
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
                type='submit'
                fullWidth
                variant='contained'
                sx={{
                    bgcolor: BROWN,
                    color: WHITE,
                    borderRadius: '25px',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    '&:hover': { bgcolor: WHITE, color: BROWN },
                }}
            >
              {clickedButton}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    );
};