const axios = require('axios');
const { authValidationRules, signupValidationRules, validateRequest } = require('../middleware/validation');

module.exports = (app, passport) => {
  // =============================================================================
  // DEMOGRAPHIC FILTERS CONFIGURATION ==========================================
  // =============================================================================

  const DEMOGRAPHIC_FILTERS = {
    age: [
      { label: '18-24', variables: ['B01001_007E', 'B01001_008E', 'B01001_009E', 'B01001_010E', 'B01001_011E'] },
      { label: '25-34', variables: ['B01001_011E', 'B01001_012E'] },
      { label: '35-44', variables: ['B01001_013E', 'B01001_014E'] },
      { label: '45-54', variables: ['B01001_015E', 'B01001_016E'] },
      { label: '55+',   variables: ['B01001_017E', 'B01001_018E', 'B01001_019E', 'B01001_020E', 'B01001_021E', 'B01001_022E', 'B01001_023E', 'B01001_024E', 'B01001_025E'] },
    ],
    income: [
      { label: 'Under $30k', variables: ['B19001_002E', 'B19001_003E', 'B19001_004E', 'B19001_005E', 'B19001_006E'] },
      { label: '$30k-$60k',  variables: ['B19001_007E', 'B19001_008E', 'B19001_009E', 'B19001_010E', 'B19001_011E'] },
      { label: '$60k-$100k', variables: ['B19001_012E', 'B19001_013E'] },
      { label: '$100k+',     variables: ['B19001_014E', 'B19001_015E', 'B19001_016E', 'B19001_017E'] },
    ],
    education: [
      { label: 'High School',   variables: ['B15003_017E', 'B15003_018E'] },
      { label: 'Some College',  variables: ['B15003_019E', 'B15003_020E'] },
      { label: "Bachelor's",    variables: ['B15003_022E'] },
      { label: 'Graduate',      variables: ['B15003_023E', 'B15003_024E', 'B15003_025E'] },
    ],
    density: [
      { label: 'Urban',    threshold: '>1000' },
      { label: 'Suburban', threshold: '200-1000' },
      { label: 'Rural',    threshold: '<200' },
    ],
  };

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
  // OVERPASS API ROUTE =========================================================
  // =============================================================================

  app.get('/api/overpass', requireAuth, async (req, res) => {
    const { lat, lng, osmTag } = req.query;
    const radius = 5000; // 5km radius

    // Parse osmTag into key and value — e.g. 'amenity=restaurant'
    const [key, value] = osmTag.split('=');
    const tagFilter = value === '*'
      ? `["${key}"]`
      : `["${key}"="${value}"]`;

    const query = `
    [out:json];
    (
      node${tagFilter}(around:${radius},${lat},${lng});
      way${tagFilter}(around:${radius},${lat},${lng});
    );
    out center;
  `;

    const result = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(query)}`
    );
    res.json(result.data);
  });

  // =============================================================================
  // CENSUS API ROUTE ===========================================================
  // =============================================================================

  app.get('/api/census', requireAuth, async (req, res) => {
    const { lat, lng, filters } = req.query;
    const parsedFilters = JSON.parse(filters);

    // Always include base variables
    const baseVars = ['B19013_001E', 'B01003_001E'];

    // Flatten selected filter variables
    const selectedVars = Object.entries(parsedFilters)
      .flatMap(([group, labels]) =>
        DEMOGRAPHIC_FILTERS[group]
          .filter(opt => labels.includes(opt.label))
          .flatMap(opt => opt.variables || [])
      );

    const variables = [...new Set([...baseVars, ...selectedVars])].join(',');
    const url = `https://api.census.gov/data/2022/acs/acs5?get=${variables}&for=tract:*&in=state:*&key=${process.env.CENSUS_API_KEY}`;

    const result = await axios.get(url);
    res.json(result.data);
  });
};