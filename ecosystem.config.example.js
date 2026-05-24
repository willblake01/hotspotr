// ecosystem.config.js
// Copy this file to ecosystem.config.js and fill in your values.
// Never commit ecosystem.config.js — it may contain environment-specific secrets.

module.exports = {
  apps: [
    {
      name: 'hotspotr',
      script: 'server.js',
      instances: 'max',       // use all available CPU cores
      exec_mode: 'cluster',
      watch: false,           // set to true in development if not using nodemon
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      }
    }
  ]
};
