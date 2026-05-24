import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom'; // Redirect removed in v6, replaced by Navigate
import { userSignUp, userLogIn } from '../utils/API';
import { signup, login } from '../actions/actionCreators';

export const AuthModal = ({ clickedButton, activeModal, toggleModal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dispatch = useDispatch();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
  };

  // BUG FIX: original mixed async/await with .then() — pick one pattern.
  // Using async/await consistently with try/catch for error handling.
  const handleSignup = async () => {
    try {
      const res = await userSignUp({ email, password });
      dispatch(signup(res));
      if (res) setIsLoggedIn(true);
    } catch (err) {
      console.error('Signup error:', err);
      alert('Signup failed. Please try again.');
    }
  };

  const handleLogin = async () => {
    try {
      const res = await userLogIn({ email, password });
      dispatch(login(res));
      if (res) setIsLoggedIn(true);
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed. Please check your credentials.');
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      alert('Please enter a valid email and password');
      return;
    }
    if (clickedButton === 'Sign Up') {
      await handleSignup();
    } else if (clickedButton === 'Login') {
      await handleLogin();
    }
    setEmail('');
    setPassword('');
    toggleModal();
  };

  // Navigate replaces Redirect in React Router v6.
  // `replace` prevents the login page from being in the browser history.
  if (isLoggedIn) {
    return <Navigate to='/dashboard' replace />;
  }

  return (
      <div className={`modal ${activeModal ? 'is-active' : ''}`}>
        <div className='modal-background' />
        <div className='modal-content'>
          <button
              className='modal-close is-large'
              aria-label='close'
              onClick={toggleModal}
          />
          <form onSubmit={handleFormSubmit}>
            <label>
              <h3>Email</h3>
              <input
                  type='text'
                  name='email'
                  value={email}
                  onChange={handleInputChange}
              />
            </label>
            <br />
            <label>
              <h3>Password</h3>
              <input
                  type='password'
                  name='password'
                  value={password}
                  onChange={handleInputChange}
              />
            </label>
            <br />
            <input
                className='submit-button'
                type='submit'
                value={clickedButton}
            />
          </form>
        </div>
      </div>
  );
};