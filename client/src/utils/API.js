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

export const getAuthStatus = () =>
    axios.get('/auth/status').then((res) => res.data);

export const geocodeLocation = async (query) => {
  const token = process.env.REACT_APP_MAPBOX_TOKEN;
  const url = `https://api.mapbox.com/search/geocode/v6/forward` +
      `?q=${encodeURIComponent(query)}&country=us&limit=5&access_token=${token}`;

  const res = await axios.get(url);
  const features = res.data.features;

  if (!features || features.length === 0) {
    throw new Error('No results found for this location.');
  }

  const [lng, lat] = features[0].geometry.coordinates;
  const bbox = features[0].properties.bbox || null;
  const placeName = features[0].properties.full_address;

  return { lat, lng, bbox, placeName, query };
};