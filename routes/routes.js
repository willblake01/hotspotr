const { authValidationRules, signupValidationRules, validateRequest } = require('../middleware/validation');

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
};