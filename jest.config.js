module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test file patterns - only include backend tests
  testMatch: ['**/test/test.js'],

  // Exclude client directory and setup file from tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/client/',
    '/test/setup.js'
  ],

  // Coverage configuration
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'routes/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'config/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/test/**',
    '!**/coverage/**',
    '!**/client/**'
  ],

  // Verbose output
  verbose: true,

  // Test timeout (30 seconds for integration tests)
  testTimeout: 30000,

  // Force exit after tests complete
  forceExit: true,

  // Detect open handles (helps find async operations that prevent Jest from exiting)
  detectOpenHandles: false
};


