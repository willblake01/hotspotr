'use strict';

const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs'); // replaces deprecated bcrypt-nodejs

module.exports = (passport, user) => {
    const User = user;

    // =========================================================================
    // passport session setup
    // =========================================================================

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findByPk(id)
            .then((user) => done(null, user))
            .catch((err) => done(err));
    });

    // =========================================================================
    // LOCAL LOGIN
    // =========================================================================

    passport.use(
        'local-login',
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true
            },
            (req, email, password, done) => {
                User.findOne({ where: { localemail: email } })
                    .then((user) => {
                        if (!user) {
                            return done(null, false, req.flash('loginMessage', 'Unknown user.'));
                        }

                        // bcryptjs.compareSync — same API as bcrypt-nodejs
                        if (!bcrypt.compareSync(password, user.localpassword)) {
                            return done(null, false, req.flash('loginMessage', 'Wrong password.'));
                        }

                        return done(null, user);
                    })
                    .catch((e) => {
                        return done(null, false, req.flash('loginMessage', `${e.name}: ${e.message}`));
                    });
            }
        )
    );

    // =========================================================================
    // LOCAL SIGNUP
    // =========================================================================

    passport.use(
        'local-signup',
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true
            },
            (req, email, password, done) => {
                User.findOne({ where: { localemail: email } })
                    .then((existingUser) => {
                        if (existingUser) {
                            return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                        }

                        // Hash the password
                        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8));

                        // Create brand new user
                        // Note: The previous OAuth account linking logic has been removed
                        // as it posed a security vulnerability. Logged-in users are now
                        // prevented from accessing the signup endpoint in routes.js
                        const newUser = User.build({
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            localemail: email,
                            localpassword: hashedPassword
                        });

                        return newUser
                            .save()
                            .then((savedUser) => done(null, savedUser))
                            .catch((err) => done(null, false, req.flash('loginMessage', err.message)));
                    })
                    .catch((e) => {
                        return done(null, false, req.flash('loginMessage', `${e.name}: ${e.message}`));
                    });
            }
        )
    );
};