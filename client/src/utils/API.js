import axios from 'axios';

export const getCurrentUser = () => {
  return axios.get('/api/user/current')
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error('Get current user error:', error.response?.data || error.message);
      return null;
    });
}

export const userSignUp = user => {
  return axios.post('/signup', user)
    .then((response) => {
      return user;
    })
    .catch((error) => {
      console.error('Signup error:', error.response?.data || error.message);
      throw error;
    });
}

export const userLogIn = user => {
  return axios.post('/login', user)
    .then((response) => {
      return user;
    })
    .catch((error) => {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    });
}

export const userLogOut = () => {
  return axios.get('/logout');
}

export const sendTest = keyword => {
  return axios.post('/call', keyword);
}
