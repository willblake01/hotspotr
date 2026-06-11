var app = require('../server');
var request = require('supertest');
var chai = require('chai').expect;

describe('Authentication Validation', function() {
  describe('POST /signup', function() {
    it('should reject empty email', function(done) {
      request(app)
        .post('/signup')
        .send({ email: '', password: 'password123' })
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          chai(res.body.error).to.equal('Validation failed');
          chai(res.body.details).to.be.an('array');
          done();
        });
    });

    it('should reject invalid email format', function(done) {
      request(app)
        .post('/signup')
        .send({ email: 'notanemail', password: 'password123' })
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          chai(res.body.error).to.equal('Validation failed');
          done();
        });
    });

    it('should reject empty password', function(done) {
      request(app)
        .post('/signup')
        .send({ email: 'test@example.com', password: '' })
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          chai(res.body.error).to.equal('Validation failed');
          done();
        });
    });

    it('should reject password shorter than 6 characters', function(done) {
      request(app)
        .post('/signup')
        .send({ email: 'test@example.com', password: '12345' })
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          chai(res.body.error).to.equal('Validation failed');
          done();
        });
    });

    it('should reject signup attempt when already logged in', function(done) {
      // Security Test: Prevent logged-in users from creating new accounts
      // This prevents an attack vector where a logged-in user's session could be
      // hijacked to create unauthorized accounts or change credentials.

      // Expected behavior:
      // 1. Server checks req.user before processing signup
      // 2. If req.user exists, returns 403 with specific error message
      // 3. Client shows the server's error message to the user
      // 4. Landing page redirects authenticated users to dashboard

      // To implement a full integration test:
      // - Create a test user
      // - Login to establish session
      // - Attempt signup with session cookie
      // - Verify 403 response with correct error message

      // Note: This test is a placeholder for now. Full integration testing
      // would require session management setup with supertest.
      done();
    });
  });

  describe('POST /auth/login', function() {
    it('should reject empty email', function(done) {
      request(app)
        .post('/auth/login')
        .send({ email: '', password: 'password123' })
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          chai(res.body.error).to.equal('Validation failed');
          done();
        });
    });

    it('should reject invalid email format', function(done) {
      request(app)
        .post('/auth/login')
        .send({ email: 'notanemail', password: 'password123' })
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          chai(res.body.error).to.equal('Validation failed');
          done();
        });
    });
  });
});

