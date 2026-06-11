const axios = require('axios');
const { authValidationRules, signupValidationRules, validateRequest } = require('../middleware/validation');

module.exports = (app, passport) => {
  // =============================================================================
  // AUTH ROUTES ================================================================
  // =============================================================================

  // Get authentication status (for Redux rehydration on page refresh)
  app.get('/auth/status', (req, res) => {
    if (req.user) {
      // Return current user data for authenticated users
      res.json({
        user: {
          id: req.user.id,
          email: req.user.localemail,
          firstName: req.user.firstName,
          lastName: req.user.lastName
        }
      });
    } else {
      // Return null user for unauthenticated requests
      res.json({ user: null });
    }
  });

  // Get current logged-in user (legacy endpoint, kept for backwards compatibility)
  app.get('/auth/user', (req, res) => {
    if (req.user) {
      // Only send safe user data (no password)
      res.json({
        id: req.user.id,
        email: req.user.localemail,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
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
        return res.redirect('/dashboard');
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
        return res.redirect('/dashboard');
      });
    })(req, res, next);
  });

  // LOGOUT ==============================
  app.post('/auth/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });

  // =============================================================================
  // PROTECTED ROUTES ===========================================================
  // =============================================================================

  // PROFILE SECTION =========================
  app.get('/dashboard', isLoggedIn, (req, res) => {
    req.user ? res.send(true) : res.send(false)
  });

  // =============================================================================
  // API ROUTES =================================================================
  // =============================================================================

  app.post('/api/call', (req, res) => {
    const keyword = req.body.keyword;
    axios
      .get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=30.2672,-97.7431&radius=50000&keyword=${keyword}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`
      )
      .then(result => {
        res.json(result.data);
      });
  });
};

// route middleware to ensure user is logged in
const isLoggedIn = (req, res, next) => {
  req.isAuthenticated() ? next() : res.redirect('/')
}
