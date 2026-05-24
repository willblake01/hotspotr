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
                        // BUG FIX: original code was missing `return` here, causing execution
                        // to fall through into the req.user and newUser blocks simultaneously.
                        if (existingUser) {
                            return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                        }

                        // Hash the password — bcryptjs.hashSync no longer takes a null third arg
                        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8));

                        // Connecting a new local account to an existing session
                        if (req.user) {
                            const user = req.user;
                            user.localemail = email;
                            // BUG FIX: original called User.generateHash() as a static method,
                            // but generateHash is an instance method on User.prototype.
                            // Using bcrypt directly here is clearer and avoids the confusion.
                            user.localpassword = hashedPassword;
                            return user
                                .save()
                                .then((savedUser) => done(null, savedUser))
                                .catch((err) => done(err));
                        }

                        // Brand new user
                        const newUser = User.build({
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