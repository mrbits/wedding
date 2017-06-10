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
        Guest.getGuestById(jwt_payload.id, (err, guest) => {
            console.log('guest by id..')
            console.log(guest)
            console.log(err)
            if(err){
                return done(err, false)
            }
            if(guest){
                return done(null, {id: guest._id, partyLeaderFirstName: guest.partyLeaderFirstName,  partyLeaderLastName: guest.partyLeaderLastName})
            } else {
                return done(null,false)
            }
        })
    }))
}
