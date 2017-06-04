const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const Guest = require ('../models/guest')
const config = require('../config/database')

module.exports = function(passport){
    let opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeader()
    opts.secretOrKey = config.secret
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        console.log('passport..')
        Guest.getGuestById(jwt_payload._id, (err, guest) => {
            console.log('guest by id..')
            console.log(guest)
            console.log(err)
            if(err){
                return done(err, false)
            }
            if(guest){
                return done(null, guest._id)
            } else {
                return done(null,false)
            }
        })
    }))
}
