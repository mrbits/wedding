const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

//guest schema
const GuestSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    partyLeaderFirstName: {
        type: String,
        required: true
    },
    partyLeaderLastName: {
        type: String,
        required: true
    },
    unicorn: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    phone: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    invite: {
        type: Boolean
    },
    inviteDate: {
        type: Date
    },
    rsvp: {
        type: Boolean
    },
    rsvpDate: {
        type: Date
    },
    mealOption: {
        type: String
    },
    mealOptionDate: {
        type: Date
    },
    thankYou: {
        type: Boolean
    },
    giftReceived: {
        type: Boolean
    },
    kid: {
        type: Boolean
    },
    rsvpMessage: {
        type: String
    },
    rsvpMessagePrivate: {
        type: Boolean
    },
    visitCount: {
        type: Number
    },
    facebookId: {
        type: String
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordTokenExpires: {
        type: Date
    },
    requestedSong: {
        type: String
    }
});

const Guest = module.exports = mongoose.model('Guest', GuestSchema);

module.exports.getGuestById = function(id, callback) {
    Guest.findById(id, callback)
}
//find guest by email (authenticate)
module.exports.getGuestsByEmail = function(email, callback) {
    const query = {email: email}
    Guest.find(query, callback)
}
//get ONE record that matches full name in db
module.exports.getGuestsByFullName = function(lastname, firstname, callback) {
    console.log(lastname)
    console.log(firstname)

    if(firstname === undefined || firstname.trim() === ""){
        this.getGuestsByLastName(lastname, callback)
    } else {
        const query = { lastName: new RegExp(lastname,'i'), 
        firstName: new RegExp(firstname,'i') ,
        inviteDate: { $lt: new Date('2017-05-01')}}
        Guest.find(query, callback)
    }
}
//get MULTIPLE records that match last name in db
module.exports.getGuestsByLastName = function(lastname, callback) {
    const query = {lastName: new RegExp(lastname, 'i'), inviteDate: { $lt: new Date('2017-05-01')}}
    Guest.find(query, callback)
}
module.exports.getGuestsByFacebookId = function(facebookId, callback) {
    const query = {facebookId: new RegExp(facebookId, 'i'), inviteDate: { $lt: new Date('2017-05-01')}}
    Guest.find(query, callback)
}
module.exports.registerGuest = function(guest, callback) {
    console.log(guest)
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(guest.unicorn, salt, (err, hash) => {
            if(err) throw err
            guest.unicorn = hash
            Guest.findOneAndUpdate({_id:guest._id}, guest, {upsert:true}, callback)
        })
    })
}
module.exports.updateGuest = function(guest, callback) {
    console.log('update guest..')
    console.log(guest)
    if(guest.unicorn === undefined){
        console.log('unicorn undefined..')
        Guest.findOneAndUpdate({_id:guest._id}, guest, callback)
    } else {
        bcrypt.genSalt(10, (err, salt) => {
            console.log('gen salt..')
            bcrypt.hash(guest.unicorn, salt, (err, hash) => {
                if(err) throw err
                guest.unicorn = hash
                console.log(hash)
                guest.save(guest, callback)
                // Guest.findOneAndUpdate({_id:guest._id}, guest, callback)
            });
        });
    }
}
module.exports.getPartyByLeader = function(partyLeaderFirstName, partyLeaderLastName, callback) {
    const query = {partyLeaderFirstName: new RegExp(partyLeaderFirstName, 'i'), partyLeaderLastName: new RegExp(partyLeaderLastName, 'i')}
    Guest.find(query, callback)
}
module.exports.getPartyById = function(id, callback) {
    console.log(id)
    const query = {_id: id}
    Guest.findOne(query, (err, guest) => {
        const query = {partyLeaderFirstName: new RegExp(guest.partyLeaderFirstName, 'i'), partyLeaderLastName: new RegExp(guest.partyLeaderLastName, 'i')}
        Guest.find(query, callback)
    })
    
}
module.exports.comparePassword = function(unicorn, hash, callback) {
    console.log("compare password...")
    console.log(unicorn)
    console.log(hash)
    bcrypt.compare(unicorn,hash, (err, isMatch) => {
        if(err) throw err
        callback(null, isMatch)
    });
}