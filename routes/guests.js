const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken')
const config = require('../config/database')
const Guest = require('../models/guest')
const async = require('async')
const crypto = require('crypto')
const nodemailer = require('nodemailer')

const privateFields = [
    "_id",
    "partyLeaderFirstName",
    "partyLeaderLastName",
    "unicorn",
    "thankYou",
    "giftReceived",
    "gift",
    "visitCount",
    "resetPasswordToken",
    "resetPasswordExpires"
]
const errTitle = 'robot meltdown'
const oopsTitle = 'oops'
const greatTitle = 'great job'
const successTitle = 'success'
const niceTitle = 'nice'

//find user in db
router.post('/find', (req, res, next) => {
  const firstName = req.body.firstName
  const lastName = req.body.lastName
  const email = req.body.email
  const facebookId = req.body.facebookId
  console.log(firstName)
  console.log(lastName)
  console.log(email)
  console.log(facebookId)
  async.waterfall([
    getGuestsByEmail(email),
    async.apply(getGuestsByFacebookId, facebookId),
    async.apply(getGuestsByFullName, firstName, lastName),
    async.apply(getGuestsByLastName, lastName)

  ], function (err, guestsFound, guests) {
      if (err) throw err
      let title = ''
      let msg = ''
      console.log(guests)
      if (guests === null){
        title = oopsTitle
        msg = 'Invite Not Found, Contact Luke or Amanda'
        res.json({success: guestsFound, title: title, msg: msg, guests: guests})
      } else if (guests.length === 1) {
        Guest.getPartyByLeader(guests[0].partyLeaderFirstName, guests[0].partyLeaderLastName, (err, gs) => {
          if (err) throw err
          gs.forEach(g => {
            g = getPublicData(g)
          })
          guests = gs
          res.json({success: guestsFound, title: successTitle, msg: 'Party Found!', guests: guests})
        })
      } else {
        res.json({success: guestsFound, title: successTitle, msg: 'More than 1 Potential Invite Found', guests: guests})
      }

      // else if (guests.length === 1){
      //   title = successTitle
      //   msg = 'Invite Found'
      // } else {
      //   title = successTitle
      //   msg = 'More Than 1 Potential Invite Found'
      // }
      
  })
})

function getGuestsByEmail(email){
  console.log('get guests email..')
  console.log(email)
  return function (callback){
    console.log('inside callback..')
    if (email === undefined){
      callback(null, false, null)//no err, guests not found
    } else {
      Guest.getGuestsByEmail(email, (err, guests) => {
        console.log(guests.length)
        if (guests.length<1){
          callback(err, false, null)//err, guests not found
        } else {
          callback(err, true, guests)//err, guests found
        }
      })
    }
  }
}

function getGuestsByFacebookId(facebookId, guestsFound, guests, callback){
  console.log('get guests facebookId..')
  // console.log(facebookId)
  console.log('inside callback..')
  if(guestsFound){
    callback(null, true, guests)
  }
  else if (facebookId === undefined){
    callback(null, false, null)//no err, guests not found
  } else {
    Guest.getGuestsByFacebookId(facebookId, (err, guests) => {
      console.log(guests.length)
      if (guests.length<1){
        callback(err, false, null)//err, guests not found
      } else {
        callback(err, true, guests)//err, guests found
      }
    })
  }
  
}

function getGuestsByFullName(firstName, lastName, guestsFound, guests, callback){
  console.log('get guests fullname..')
  console.log(firstName)
  console.log(lastName)
  console.log(guestsFound)
  console.log(guests)
    if (guestsFound){
      callback(null, true, guests)
    } else if (firstName === undefined || lastName === undefined){
      callback(null, false, null)//no err, guests not found
    } else {
      Guest.getGuestsByFullName(firstName, lastName, (err, guests) => {
        if (guests.length<1){
          console.log('guests < 1')
          callback(err, false, null)
        } else {
          callback(err, true, guests)
        }
      })
    }
}

function getGuestsByLastName(lastName, guestsFound, guests, callback){
  console.log('get guests lastname..')
  console.log(lastName)
  console.log(guestsFound)
  console.log(guests)
  if (guestsFound){
    callback(null, true, guests)
  }
  else if (lastName === undefined){
    callback(null, false, null)//no err, guests not found
  } else {
    Guest.getGuestsByLastName(lastName, (err, guests) => {
      if (guests.length<1){
        callback(err, false, null)//err, guests not found
      } else {
        callback(err, true, guests)//err, guests found
      }
    })
  }
}

// register guest
router.post('/register', (req, res, next) => {
  console.log(req.body.unicorn)
  let newGuest = new Guest({
    _id: req.body._id,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    unicorn: req.body.unicorn || req.body.facebookId,
    invite: true,
    inviteDate: Date.now(),
    facebookId: req.body.facebookId,
  })

  Guest.registerGuest(newGuest, (err, user) => {
    if( err){
      res.json({success: false, title: errTitle, msg:'Failed to register guest'})
    } else {
      res.json({success: true, title: successTitle, msg:newGuest.firstName + ' registered successfully!'})
    }
  })
})

// login
router.post('/authenticate', (req, res, next) => {
  const email = req.body.email
  const unicorn = req.body.unicorn
  
  Guest.getGuestsByEmail(email, (err, guests) => {
    if (err){
      res.json({success: false, title: errTitle, msg:'Failed to find email'})
      throw err
    }
   
    if (guests.length<1){
      return res.json({success: false, title: oopsTitle, msg: 'Email Not Found'})
    }

    Guest.comparePassword(unicorn, guests[0].unicorn, (err, isMatch) => {
      if (err){
        res.json({success: false, title: errTitle, msg:'Failed to Login'})
        throw err
      }
      if (isMatch){
        const token = jwt.sign({id: guests[0]._id, partyLeaderFirstName: guests[0].partyLeaderFirstName, partyLeaderLastName: guests[0].partyLeaderLastName}, config.secret, {
          expiresIn: 604800 // 1 week
        })
        Guest.getPartyByLeader(guests[0].partyLeaderFirstName, guests[0].partyLeaderLastName, (err, guests) => {
          guests.forEach(g => {
            g = getPublicData(g)
          })
          
          res.json({
            success: true,
            title: successTitle,
            msg: 'Facebook Account Registered',
            token: 'JWT '+token,
            guests: guests
          })
        })
        
      } else {
        return res.json({success: false, title: oopsTitle, msg: 'Invalid Email or Password'})
      }
    })
  })
})

router.post('/authenticate-facebook', (req, res, next) => {
  const facebookId = req.body.facebookId
  // return getParty()
  Guest.findOne({facebookId: facebookId}, (err, guest) => {
    if (err) throw err
    if (guest == null) {
      return res.json({success: false, title: oopsTitle, msg: 'Facebook Account Not Registered'})
    } else {
      const token = jwt.sign({id: guest._id, partyLeaderFirstName: guest.partyLeaderFirstName, partyLeaderLastName: guest.partyLeaderLastName}, config.secret, {
          expiresIn: 604800 // 1 week
        })
        Guest.getPartyByLeader(guest.partyLeaderFirstName, guest.partyLeaderLastName, (err, guests) => {
          guests.forEach(g => {
            g = getPublicData(g)
          })
          
          res.json({
            success: true,
            title: successTitle,
            msg: 'Facebook Account Registered',
            token: 'JWT '+token,
            guests: guests
          })
        })
        
      // return res.json({success: true, title: successTitle, msg: 'Facebook Account Registered'})
    }
  })
})

router.post('/update', (req, res, next) => {
  console.log('update..')
  let guest = new Guest({
    _id: req.body._id,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    address: req.body.address,
    phone: req.body.phone,
    email: req.body.email,
    rsvp: req.body.rsvp,
    rsvpDate: req.body.rsvpDate,
    mealOption: req.body.mealOption,
    mealOptionDate: req.body.mealOptionDate,
    rsvpMessage: req.body.rsvpMessage,
    rsvpMessagePrivate: req.body.rsvpMessagePrivate,
    requestedSong: req.body.requestedSong,

  })
  let itemsProcessed = 0
  console.log('before get guests..')

  Guest.getGuestsByEmail(guest.email, (err, guests) => {
    if (err) {
      res.json({success: false, title: errTitle, msg: 'Error saving changes'})
      throw err
    }
    else if (guests.length>0) {
      console.log(guests)
      guests.forEach(g => {
        itemsProcessed++
        console.log(guest._id)
        console.log(g._id)
        if (guest._id.equals(g._id)){
          console.log('match..')
          g = guest
          console.log(g)
        } else {
          // g = getPublicData(g)
          // g.address = guest.address
          // g.phone = guest.phone
          // g.email = guest.email
        }
        Guest.findOneAndUpdate({_id:g._id}, g, (err) => {
          console.log(err)
          if (err) {
            console.log(g)
            res.json({success: false, title: errTitle, msg: 'Error saving changes'})
            throw err
          }
        })
        console.log('finished..')

        if (itemsProcessed === guests.length){
          res.json({success: true, title: successTitle, msg: g.firstName + ', your changes have been saved', guest: guest})
        }
      })
    } else {
      res.json({success: false, title: errTitle, msg: g.firstName + ', an account with email ' + g.email + ' cannot be found'})
    }
  })
})

router.post('/forgot', (req, res, next) => {
  //send email
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      let itemsProcessed = 0
      Guest.find({ email: req.body.email }, function(err, guests) {
        if (guests.length<1) {
          res.json({success: true, title: errTitle, msg: 'No account with that email address exists.'})
          // return res.redirect('/forgot');
        }
          guests.forEach(guest => {
            
            guest.resetPasswordToken = token;
            guest.resetPasswordTokenExpires = Date.now() + 3600000; // 1 hour
            console.log(guest)
            guest.save(function(err) {
              itemsProcessed++
              if (itemsProcessed === guests.length)
              done(err, token, guests)
            })
          })
        
      })
    },
    function(token, guests, done) {
      var smtpTransport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
            user: config.email,
            pass: config.emailSecret
        }
      });
      var mailOptions = {
        to: guests[0].email,
        from: 'passwordreset@lukeandamanda.life',
        subject: 'Luke & Amanda Wedding Site Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://localhost:3000/reset/' + token + '\n\n' +
          'If you did not request this, please contact Luke or Amanda. Meanwhile, if you ignore this email, then your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        res.json({success: true, title: niceTitle, msg: 'An e-mail has been sent to ' + guests[0].email + ' with further instructions.', token: token})
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err){
      res.json({success: false, title: errTitle, msg:'Failed to send password reset email'})
      throw err
    }
    res.json({success: true, title: niceTitle, msg: 'An e-mail has been sent to ' + guest.email + ' with further instructions.'})
  });
})

router.get('/reset/:token', (req, res, next) => {
    //redirect to angular route  
})

router.post('/reset/:token', (req, res, next) => {
  console.log('post..')
  console.log(req.body)
  console.log(req.params.token)
  async.waterfall([
    function(done) {
      let itemsProcessed = 0
      Guest.find({ resetPasswordToken: req.params.token, resetPasswordTokenExpires: { $gt: Date.now() } }, function(err, guests) {
        if (guests.length<1) {
          res.json({success: false, title: errTitle, msg: 'Password reset token is invalid or has expired.'})
        }
        guests.forEach(guest => {
          guest.unicorn = req.body.password
          guest.resetPasswordToken = ''
          guest.resetPasswordTokenExpires = new Date('1900-01-01')
          itemsProcessed++
          if (itemsProcessed === guests.length){
            Guest.updateGuest(guest, done(err,guests))
          } else {
            Guest.updateGuest(guest, (err) => {
              if (err) throw err
            })
          }
        })
      })
    },
    function(guests, done) {
      console.log('email bit..')
      var smtpTransport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
            user: config.email,
            pass: config.emailSecret
        }
      })
      var mailOptions = {
        to: guests[0].email,
        from: 'passwordreset@lukeandamanda.life',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + guests[0].email + ' has just been changed.\n'
      }
      smtpTransport.sendMail(mailOptions, function(err) {
        done(err);
      })
    }
  ], function(err) {
        if (err){
          res.json({success: false, title: errTitle, msg:'Failed to reset password'})
          throw err
        }
        res.json({success: true, title: greatTitle, msg: 'Your password has been changed.'})
  })
})

// Profile
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    // console.log(req);
    console.log('profile..')
    console.log(req.user.partyLeaderFirstName)
    console.log(req.user.partyLeaderLastName)
    let itemsProcessed = 0
    Guest.find({ partyLeaderFirstName: req.user.partyLeaderFirstName, partyLeaderLastName: req.user.partyLeaderLastName }, 
      function(err, guests) {
        if (guests.length<1) {
          res.json({success: false, title: errTitle, msg: 'Failed to Retrieve Party'})
          // return res.redirect('/forgot');
        }
        guests.forEach(guest => {
          guest = getPublicData(guest)
          itemsProcessed++
          if (itemsProcessed === guests.length) {
            res.json({success: true, title: successTitle, msg: 'Found your Party', guests: guests})
          }
        })
    })
    // Guest.getGuestsByPartyLeader(req.partyLeaderFirstname, req.partyLeaderLastName, (err, guests))
    // res.json({guest: req.id})
})

function getPublicData(guest){
  console.log('get public data..')
  Object.keys(guest.toObject()).forEach(key => {
      // console.log(key)
      if(privateFields.indexOf(key)>0){
          guest[key] = undefined
      }
  }) 
  return guest
}

module.exports = router