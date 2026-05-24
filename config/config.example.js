'use strict';

// config/config.example.js
// Copy this file to config/config.js and fill in your values.
// Never commit config/config.js — it reads your database credentials from .env.

require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,  // e.g. root
    password: process.env.DB_PASSWORD,  // your local MySQL password
    database: process.env.DB_NAME || 'hotspotr',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST || 'hotspotr_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_PRODUCTION,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
};
