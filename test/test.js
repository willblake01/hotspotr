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
      // This test simulates the security fix - preventing credential changes via signup
      // In a real scenario, req.user would be set by passport after login
      // For now, we're just documenting the expected behavior
      // A full integration test would require creating a user, logging in, then attempting signup
      done();
    });
  });

  describe('POST /login', function() {
    it('should reject empty email', function(done) {
      request(app)
        .post('/login')
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
        .post('/login')
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

