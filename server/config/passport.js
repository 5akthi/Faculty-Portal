const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Faculty = require('../models/faculty')

const keys = require('./key');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            const student = await Faculty.findById(jwt_payload.id);
            if (faculty) {
                return done(null, faculty);
            } 
            else {
                console.log("Error");
            }
        }
        )
    )
};