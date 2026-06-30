const axios = require('axios');
const h3 = require('h3-js');
const { authValidationRules, signupValidationRules, validateRequest } = require('../middleware/validation');
const { DEMOGRAPHICS_FILTERS } = require('../config/demographicsFilters');

const parseCensusData = (rawData) => {
  if (!rawData || !Array.isArray(rawData) || rawData.length < 2) return {};
  const headers = rawData[0];
  const values  = rawData[1];
  if (!Array.isArray(headers) || !Array.isArray(values)) return {};
  return headers.reduce((acc, key, i) => {
    acc[key] = parseFloat(values[i]) || 0;
    return acc;
  }, {});
};

const normalizeValue = (value, max) => {
  if (!value || max === 0) return 0.5;
  return Math.min(value / max, 1);
};

const calculateDemoMatch = (parsedCensus, demographics) => {
  const hasSelections = Object.values(demographics).some(g => g.length > 0);
  if (!hasSelections) return 0.5;
  let matchScore = 0;
  let totalChecks = 0;
  if (demographics.income?.includes('$100k+')) {
    matchScore += parsedCensus['B19013_001E'] > 100000 ? 1 : 0; totalChecks++;
  }
  if (demographics.income?.includes('$60k-$100k')) {
    const income = parsedCensus['B19013_001E'];
    matchScore += (income >= 60000 && income <= 100000) ? 1 : 0; totalChecks++;
  }
  if (demographics.income?.includes('$30k-$60k')) {
    const income = parsedCensus['B19013_001E'];
    matchScore += (income >= 30000 && income < 60000) ? 1 : 0; totalChecks++;
  }
  if (demographics.income?.includes('Under $30k')) {
    matchScore += parsedCensus['B19013_001E'] < 30000 ? 1 : 0; totalChecks++;
  }
  if (demographics.density?.includes('Urban')) {
    matchScore += parsedCensus['B01003_001E'] > 5000 ? 1 : 0; totalChecks++;
  }
  if (demographics.density?.includes('Suburban')) {
    const pop = parsedCensus['B01003_001E'];
    matchScore += (pop >= 1000 && pop <= 5000) ? 1 : 0; totalChecks++;
  }
  if (demographics.density?.includes('Rural')) {
    matchScore += parsedCensus['B01003_001E'] < 1000 ? 1 : 0; totalChecks++;
  }
  return totalChecks === 0 ? 0.5 : matchScore / totalChecks;
};

const buildCensusVariables = (demographics = {}) => {
  const baseVars = ['B19013_001E', 'B01003_001E'];
  const selectedVars = Object.entries(demographics)
      .flatMap(([group, labels]) =>
          (DEMOGRAPHICS_FILTERS[group] || [])
              .filter(opt => labels.includes(opt.label))
              .flatMap(opt => opt.variables || [])
      );
  return [...new Set([...baseVars, ...selectedVars])].join(',');
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
      const variables = buildCensusVariables(parsedFilters);
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

  // =============================================================================
  // SCORING ROUTES ======================================================
  // =============================================================================

  app.post('/api/score', requireAuth, async (req, res) => {
    const { lat, lng, osmTag, radius = 5, demographics = {} } = req.body;

    if (!lat || !lng || !osmTag) {
      return res.status(400).json({ error: 'lat, lng and osmTag are required' });
    }

    // Build bbox from center + radius
    const radiusDeg = radius * 0.012;
    const bbox = [lng - radiusDeg, lat - radiusDeg, lng + radiusDeg, lat + radiusDeg];

    // Fetch Overpass data
    const [key, value] = osmTag.split('=');
    const tagFilter = value === '*' ? `["${key}"]` : `["${key}"="${value}"]`;
    const query = `
      [out:json][timeout:25];
      (
        node${tagFilter}(around:${radius * 1000},${lat},${lng});
        way${tagFilter}(around:${radius * 1000},${lat},${lng});
      );
      out center;
    `;
    const encoded = `data=${encodeURIComponent(query)}`;
    const config = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 15000,
    };

    // Fetch Census data — Step 1: geocode lat/lng to FIPS
    const geoUrl = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates` +
        `?x=${lng}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;

    const [overpassResult, censusGeoResult] = await Promise.allSettled([
      (async () => {
        for (const url of OVERPASS_ENDPOINTS) {
          try {
            const result = await axios.post(url, encoded, config);
            return result.data;
          } catch (err) {
            console.warn(`Overpass endpoint ${url} failed:`, err.message);
            await sleep(1000);
          }
        }
        throw new Error('All Overpass endpoints unavailable');
      })(),
      axios.get(geoUrl),
    ]);
 
    const elements = overpassResult.status === 'fulfilled'
        ? overpassResult.value.elements || []
        : [];

    // Step 2 — fetch ACS data if geocoding succeeded
    let censusData = null;
    if (censusGeoResult.status === 'fulfilled') {
      const tract = censusGeoResult.value.data.result.geographies['Census Tracts']?.[0];
      if (tract) {
        const variables = buildCensusVariables(demographics);
        const acsUrl = `https://api.census.gov/data/2022/acs/acs5` +
            `?get=${variables}&for=tract:${tract.TRACT}&in=state:${tract.STATE}%20county:${tract.COUNTY}` +
            `&key=${process.env.CENSUS_API_KEY}`;
        try {
          const acsResult = await axios.get(acsUrl);
          censusData = acsResult.data;
        } catch (err) {
          console.warn('Census ACS error:', err.message);
        }
      }
    }

    const parsedCensus = censusData ? parseCensusData(censusData) : null;

    // Dynamic resolution based on search area
    const bboxWidth = Math.abs(bbox[2] - bbox[0]);
    const resolution = bboxWidth > 2.0 ? 7 : bboxWidth > 0.5 ? 8 : 9;
    const thresholdDeg = resolution === 7 ? 0.02 : resolution === 8 ? 0.009 : 0.004;

    // Generate H3 cells
    const polygon = [
      [lat - radiusDeg, lng - radiusDeg],
      [lat - radiusDeg, lng + radiusDeg],
      [lat + radiusDeg, lng + radiusDeg],
      [lat + radiusDeg, lng - radiusDeg],
      [lat - radiusDeg, lng - radiusDeg],
    ];

    let cells = [];
    try {
      cells = h3.polygonToCells(polygon, resolution);
    } catch (err) {
      console.error('H3 error:', err.message);
      return res.status(500).json({ error: 'Failed to generate scoring grid' });
    }

    // Filter cells to search radius
    const cellsInRadius = cells.filter((cell) => {
      const [clat, clng] = h3.cellToLatLng(cell);
      const dist = Math.sqrt(Math.pow(clat - lat, 2) + Math.pow(clng - lng, 2));
      return dist <= radiusDeg;
    });

    // Count competitors per cell
    const cellCounts = cellsInRadius.map((cell) => {
      const [clat, clng] = h3.cellToLatLng(cell);
      return elements.filter((el) => {
        const elat = el.lat ?? el.center?.lat;
        const elon = el.lon ?? el.center?.lon;
        if (!elat || !elon) return false;
        return Math.abs(elat - clat) < thresholdDeg && Math.abs(elon - clng) < thresholdDeg;
      }).length;
    });

    const localMax = Math.max(...cellCounts, 1);

    // Score each cell
    const medianIncome = parsedCensus ? normalizeValue(parsedCensus['B19013_001E'], 250000) : 0.5;
    const popDensity   = parsedCensus ? normalizeValue(parsedCensus['B01003_001E'], 100000) : 0.5;
    const demoMatch    = parsedCensus ? calculateDemoMatch(parsedCensus, demographics) : 0.5;

    const features = cellsInRadius.map((cell, i) => {
      const competitorGap = 1 - (cellCounts[i] / localMax);
      const weight = (competitorGap * 0.25) +
          (medianIncome  * 0.25) +
          (popDensity    * 0.20) +
          (demoMatch     * 0.20) +
          (competitorGap * 0.10);

      const boundary = h3.cellToBoundary(cell).map(([lat, lon]) => [lon, lat]);
      boundary.push(boundary[0]);

      return {
        type: 'Feature',
        properties: { weight: Math.min(Math.max(weight, 0), 1) },
        geometry: { type: 'Polygon', coordinates: [boundary] }
      };
    });

    res.json({
      geoJSON: { type: 'FeatureCollection', features },
      competitors: elements,  // raw elements for competitor pins
    });
  });
};