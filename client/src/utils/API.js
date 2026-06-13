import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
    withCredentials: true,
});

export const userSignUp = user => api.post('/auth/signup', user)
    .then((response) => response.data.user)
    .catch((error) => {
      console.error('Signup error:', error.response?.data || error.message);
      throw error;
    });

export const userLogIn = user => api.post('/auth/login', user)
    .then((response) => response.data.user)
    .catch((error) => {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    });

export const userLogOut = () => api.post('/auth/logout');

export const getAuthStatus = () => api.get('/auth/status').then((res) => res.data);

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