'use strict';

// config/config.example.js
// Copy this file to config/config.js and fill in your values.
// Never commit config/config.js — it reads your database credentials from .env.

require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DATABASE_USERNAME,  // e.g. root
    password: process.env.DATABASE_PASSWORD,  // your local MySQL password
    database: process.env.DATABASE_NAME || 'hotspotr',
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: process.env.DATABASE_PORT || 3306,
    dialect: 'mysql',
    logging: false
  },
  test: {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME_TEST || 'hotspotr_test',
    host: process.env.DATABASE_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME_PRODUCTION,
    host: process.env.DATABASE_HOST,
    dialect: 'mysql',
    logging: false
  }
};
