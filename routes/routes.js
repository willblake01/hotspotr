const axios = require('axios');
const { authValidationRules, signupValidationRules, validateRequest } = require('../middleware/validation');
const { DEMOGRAPHICS_FILTERS } = require('../config/demographicsFilters');

module.exports = (app, passport) => {
  // =============================================================================
  // AUTH ROUTES ================================================================
  // =============================================================================

  // Get authentication status (for Redux rehydration on page refresh)
  app.get('/auth/status', (req, res) => {
    if (req.user) {

      // Return current user data for authenticated users
      res.status(200).json({
        user: {
          id: req.user.id,
          email: req.user.localemail,
          firstName: req.user.firstName,
          lastName: req.user.lastName
        }
      });
    } else {
      // Return null user for unauthenticated requests
      res.status(200).json({ user: null });
    }
  });

  // LOGIN ===============================
  // Process the login form
  app.post('/auth/login', authValidationRules, validateRequest, (req, res, next) => {
    passport.authenticate('local-login', (err, user, info) => {
      if (err) {
        return res.status(500).json({ error: 'Authentication error', details: err.message });
      }
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials', message: info?.message || 'Login failed' });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Session error', details: err.message });
        }
        return res.status(200).json({
          user: {
            id: user.id,
            email: user.localemail,
            firstName: user.firstName,
            lastName: user.lastName
          },
        });
      });
    })(req, res, next);
  });

  // SIGNUP =================================
  // Process the signup form
  app.post('/auth/signup', signupValidationRules, validateRequest, (req, res, next) => {
    // Security: Prevent logged-in users from using signup to change credentials
    if (req.user) {
      return res.status(403).json({
        error: 'Already logged in',
        message: 'You are already logged in. Please log out first to create a new account.'
      });
    }

    passport.authenticate('local-signup', (err, user, info) => {
      if (err) {
        return res.status(500).json({ error: 'Signup error', details: err.message });
      }
      if (!user) {
        return res.status(400).json({ error: 'Signup failed', message: info?.message || 'Unable to create account' });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Session error', details: err.message });
        }
        return res.status(201).json({
          user: {
            id: user.id,
            email: user.localemail,
            firstName: user.firstName,
            lastName: user.lastName
          },
        });
      });
    })(req, res, next);
  });

  // LOGOUT ==============================
  app.post('/auth/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((destroyErr) => {
        if (destroyErr) console.error('Session destroy error:', destroyErr);
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out successfully' });
      });
    });
  });

  // =============================================================================
  // API MIDDLEWARE =============================================================
  // =============================================================================

  const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  };

  app.use('/api', requireAuth);

  // =============================================================================
  // SEARCH HISTORY ROUTES ======================================================
  // =============================================================================

  app.post('/api/search/history', (req, res) => {
    const { query, lat, lng, placeName, bbox } = req.body;

    // Skip saving geolocation entries
    if (query === 'current-location') {
      return res.status(200).json({ history: req.session.searchHistory || [] });
    }

    if (!req.session.searchHistory) req.session.searchHistory = [];

    // Prepend new entry, cap at 10
    req.session.searchHistory = [
      { query, lat, lng, placeName, bbox, timestamp: new Date().toISOString() },
      ...req.session.searchHistory
    ].slice(0, 10);

    res.status(200).json({ history: req.session.searchHistory });
  });

  app.get('/api/search/history', (req, res) => {
    res.status(200).json({ history: req.session.searchHistory || [] });
  });

  app.delete('/api/search/history', (req, res) => {
    req.session.searchHistory = [];
    res.status(200).json({ history: [] });
  });

  // =============================================================================
  // EXTERNAL API ROUTES ========================================================
  // =============================================================================

  // Census Bureau ACS API
  app.get('/api/census', requireAuth, async (req, res) => {
    const { lat, lng, filters } = req.query;

    try {
      // Step 1 — convert lat/lng to FIPS state + county + tract
      const geoUrl = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates` +
          `?x=${lng}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
      const geoResult = await axios.get(geoUrl);
      const tract = geoResult.data.result.geographies['Census Tracts']?.[0];

      if (!tract) {
        return res.status(404).json({ error: 'No census tract found for this location' });
      }

      const state  = tract.STATE;
      const county = tract.COUNTY;
      const tractId = tract.TRACT;

      // Step 2 — query ACS for that specific tract
      const parsedFilters = filters ? JSON.parse(filters) : {};
      const baseVars = ['B19013_001E', 'B01003_001E'];
      const selectedVars = Object.entries(parsedFilters)
          .flatMap(([group, labels]) =>
              (DEMOGRAPHICS_FILTERS[group] || [])
                  .filter(opt => labels.includes(opt.label))
                  .flatMap(opt => opt.variables || [])
          );

      const variables = [...new Set([...baseVars, ...selectedVars])].join(',');
      const acsUrl = `https://api.census.gov/data/2022/acs/acs5` +
          `?get=${variables}&for=tract:${tractId}&in=state:${state}%20county:${county}` +
          `&key=${process.env.CENSUS_API_KEY}`;

      const result = await axios.get(acsUrl);
      res.json(result.data);

    } catch (err) {
      console.error('Census API error:', err.message);
      res.status(502).json({ error: 'Census API unavailable' });
    }
  });

  // BLS OEWS API
  app.get('/api/bls', requireAuth, async (req, res) => {
    try {
      const result = await axios.post(
          'https://api.bls.gov/publicAPI/v2/timeseries/data/',
          {
            seriesid: ['OEUS000000000000000001'],
            registrationkey: process.env.BLS_API_KEY,
          }
      );
      res.json(result.data);
    } catch (err) {
      console.warn('BLS API unavailable:', err.message);
      res.status(502).json({ error: 'BLS API unavailable' });
    }
  });

  // OpenStreetMap Overpass API
  const OVERPASS_ENDPOINTS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  ];

  app.get('/api/overpass', requireAuth, async (req, res) => {
    const { lat, lng, osmTag, radius = 5000 } = req.query;
    const [key, value] = osmTag.split('=');
    const tagFilter = value === '*' ? `["${key}"]` : `["${key}"="${value}"]`;

    const query = `
    [out:json][timeout:25];
    (
      node${tagFilter}(around:${radius},${lat},${lng});
      way${tagFilter}(around:${radius},${lat},${lng});
    );
    out center;
  `;

    const encoded = `data=${encodeURIComponent(query)}`;
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'user-Agent': 'HotSpotr/1.0 (business location intelligence app)',
      },
      timeout: 15000,
    };

    for (const url of OVERPASS_ENDPOINTS) {
      try {
        console.log(`Trying Overpass endpoint: ${url}`);
        const result = await axios.post(url, encoded, config);
        return res.json(result.data);
      } catch (err) {
        console.warn(`Overpass endpoint ${url} failed:`, err.message);
      }
    }

    res.status(502).json({ error: 'All Overpass endpoints unavailable. Please try again.' });
  });

  app.get('/api/filters', (req, res) => {
    res.status(200).json({ filters: req.session.filters || null });
  });

  app.post('/api/filters', (req, res) => {
    req.session.filters = req.body;
    res.status(200).json({ filters: req.session.filters });
  });

  app.get('/api/session-state', (req, res) => {
    res.status(200).json({
      filters: req.session.filters || null,
      location: req.session.location || null,
    });
  });

  app.post('/api/session-state', (req, res) => {
    const { filters, location } = req.body;
    if (filters)  req.session.filters  = filters;
    if (location) req.session.location = location;
    res.status(200).json({ success: true });
  });
};