const cookieParser = require('cookie-parser');
const express = require('express');
const expressSession = require('express-session');
const history = require('connect-history-api-fallback');
const path = require('path');
const passport = require('passport');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const config = require('../config');

module.exports = function (app) {
    const wwwroot = path.resolve(__dirname, '../../wwwroot');

    // Support cookie parsing for sessions:
    app.use(cookieParser(config.secret));

    // Support body parsing:
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    // Support sessions:
    app.use(expressSession({ 
        secret: config.secret, 
        resave: true,
        saveUninitialized: true,
        store: createSessionStore()
    }));

    // Support multipart form submissions:
    app.use(fileUpload());

    // Support authentication:
    setupPassport();
    app.use(passport.initialize());
    app.use(passport.session());

    // Add routes:
    require('../routes')(app);

    // Map 404s to index.html for SPA support:
    app.use(history());

    // Support static files:
    app.use(express.static(wwwroot));
};

function createSessionStore() {
    const FileStore = require('session-file-store')(require('express-session'));
    const SECONDS_IN_DAY = 86400;

    return new FileStore({
        logFn: process.env.NODE_ENV === 'development'
            ? () => {}
            : () => {},
        path: path.resolve(__dirname, '../../.sessions'),
        ttl: SECONDS_IN_DAY
    })
}

function setupPassport() {
    const GoogleStrategy = require('passport-google-oauth20').Strategy;

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    passport.use(new GoogleStrategy({
        clientID: config.oauth.clientId,
        clientSecret: config.oauth.clientSecret,
        callbackURL: `${process.env.PHOTOSITE_OAUTH_REDIRECT_URL}/auth/google/callback`
    }, function (accessToken, refreshToken, profile, callback) {
        const { emails } = profile;

        if (emails.some(isAuthorizedEmail)) {
            callback(null, { email: emails[0].value });
        } else {
            callback('Unauthorized');
        }
    }))

    function isAuthorizedEmail(email) {
        return config.oauth.authorizedEmails.some(x => email.value.toLowerCase() === x.toLowerCase());
    }
}