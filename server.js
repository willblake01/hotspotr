'use strict';

require('dotenv').config();
const express = require('express');
const path = require('path');
const passport = require('passport');
const morgan = require('morgan');
const winston = require('winston');
const expressWinston = require('express-winston');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const { createClient } = require('redis');
const { RedisStore } = require('connect-redis');
const logger = require('./utils/logger.js');
const requestLogger = require('./utils/requestLogger.js');
const expressRequestId = require('express-request-id')();

const PORT = process.env.PORT || 3001;
const app = express();
const db = require('./models');

// =========================================================================
// Redis + Session setup
// =========================================================================

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.connect().catch((err) => {
    logger.error('Redis connection error:', err);
});

redisClient.on('error', (err) => logger.error('Redis client error:', err));
redisClient.on('connect', () => logger.info('Redis client connected.'));

const sessionStore = new RedisStore({ client: redisClient });

app.use(cookieParser());
app.use(
    session({
        store: sessionStore,
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        resave: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        }
    })
);

// =========================================================================
// Core middleware
// =========================================================================

app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
        credentials: true
    })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressRequestId);

// =========================================================================
// Auth middleware
// =========================================================================

require('./config/passport')(passport, db.User);

app.use(passport.initialize());
app.use(passport.session());

// =========================================================================
// Logging middleware
// =========================================================================

app.use(
    expressWinston.logger({
        transports: [
            new winston.transports.Console()
        ],
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.json()
        ),
        meta: true,
        expressFormat: true,
        colorize: true,

        // Security: Prevent logging of sensitive fields
        requestWhitelist: ['url', 'headers', 'method', 'httpVersion', 'originalUrl', 'query'],
        bodyBlacklist: ['password', 'localpassword', 'newPassword', 'oldPassword', 'confirmPassword'],
        ignoreRoute: function (req, res) { return false; }
    })
);

app.use(morgan('dev'));
app.use(requestLogger);

// =========================================================================
// API Routes
// =========================================================================

require('./routes/routes')(app, passport);

// =========================================================================
// Static assets + catch-all (production only)
// =========================================================================

// In development, React runs on its own dev server (port 3000) and Express
// only needs to handle API routes. Serving the build folder in dev causes
// 500 errors since client/build doesn't exist until `npm run build` is run.
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build/index.html'));
    });
}

// =========================================================================
// Error handlers
// =========================================================================

app.use((req, res) => {
    logger.warn(`404: ${req.method} ${req.originalUrl}`);
    return res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    logger.error(err.stack);
    return res.status(500).json({ error: 'Internal server error' });
});

// =========================================================================
// Start server
// =========================================================================

db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        logger.info(`Server now on port ${PORT}!`);
    });
});

module.exports = app;