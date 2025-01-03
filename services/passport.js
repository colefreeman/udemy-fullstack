const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('User'); //this is not working with 'users' evaluate why later

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy(
        {
            clientID: keys.googleClientID,
            clientSecret: keys.googleClientSecret,
            callbackURL: '/auth/google/callback',
            proxy: true
        }, 
        (accessToken, refreshToken, profile, done) => {
            User.findOne({ googleID: profile.id })
                .then((existingUser) => {
                    if (existingUser) {
                        // we already have a record with the diven profile ID
                        done(null, existingUser);
                    } else {
                        // we don't have a user record with this ID so make a new one
                        new User({ googleID: profile.id })
                            .save()
                            .then(user => done(null, user));
                    }
                })
        }
    )
);