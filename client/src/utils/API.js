import axios from 'axios';

export const getCurrentUser = () => {
  return axios.get('/auth/status')
    .then((response) => {
      // /auth/status returns { user: {...} } or { user: null }
      return response.data.user;
    })
    .catch((error) => {
      console.error('Get auth status error:', error.response?.data || error.message);
      return null;
    });
}

export const userSignUp = user => {
  return axios.post('/auth/signup', user)
    .then((_response) => {
      // Return safe user data from server (no password)
      return {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      };
    })
    .catch((error) => {
      console.error('Signup error:', error.response?.data || error.message);
      throw error;
    });
}

export const userLogIn = user => {
  return axios.post('/auth/login', user)
    .then((_response) => {
      // Return only email (no password) for security
      return {
        email: user.email
      };
    })
    .catch((error) => {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    });
}

export const userLogOut = () => {
  return axios.post('/auth/logout');
}

export const sendTest = keyword => {
  return axios.post('/api/call', keyword);
}
