const axios = require('axios');

module.exports = (app, passport) => {
  // PROFILE SECTION =========================
  app.get('/dashboard', isLoggedIn, (req, res) => {
    req.user ? res.send(true) : res.send(false)
  });

  // LOGOUT ==============================
  app.get('/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.send(false);
    });
  });

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================
  // LOGIN ===============================
  // process the login form
  app.post(
    '/login',
    passport.authenticate('local-login'), (req, res) => {
      req.user ? res.redirect('/dashboard') : res.redirect('/')
    }
  );

  // SIGNUP =================================
  // Process the signup form
  app.post(
    '/signup',
    passport.authenticate('local-signup'), (req, res) => {
      req.user ? res.redirect('/dashboard') : res.redirect('/')
    }
  );

  app.post('/call', (req, res) => {
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
  req.isAuthenticated ? next() : res.redirect('/')
}
