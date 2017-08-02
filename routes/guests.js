const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken')
const config = require('../config/database')
const Guest = require('../models/guest')
const async = require('async')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const json2csv = require('json2csv')

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
const errTitle = 'Robot Meltdown'
const oopsTitle = 'Oops'
const greatTitle = 'Great Job!'
const successTitle = 'Success!'
const niceTitle = 'Nice!'

//find user in db
router.post('/find', (req, res, next) => {
  const firstName = req.body.firstName
  const lastName = req.body.lastName
  const email = req.body.email
  const facebookId = req.body.facebookId
  console.log('find..')
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
          guests = gs.filter(g => g.inviteDate < new Date('2017-05-01'))
          console.log(guests)
          res.json({success: guestsFound, title: successTitle, msg: 'Party Found!', guests: guests})
        })
      } else {
        res.json({success: guestsFound, title: niceTitle, msg: 'More than 1 Potential Invite Found', guests: guests})
      }
      console.log('exit find..')
  })
})

function getGuestsByEmail(email){
  console.log('get guests email..')
  console.log(email)
  return function (callback){
    console.log('inside callback..')
    if (email === undefined){
      console.log('exit get guests email..')
      callback(null, false, null)//no err, guests not found
    } else {
      Guest.getGuestsByEmail(email, (err, guests) => {
        console.log(guests.length)
        console.log('exit get guests email..')
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
  console.log('exit get guests facebookId..')
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
        console.log(guests.length)
        console.log(guests)
        callback(err, false, null)
      } else {
        callback(err, true, guests)
      }
    })
  }
  console.log('exit et guests fullname..')
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
  console.log('exit get guests lastname..')
}

// register guest
router.post('/register', (req, res, next) => {
  console.log('register..')
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
      res.json({success: true, title: greatTitle, msg:newGuest.firstName + ' registered successfully!'})
    }
  })
  console.log('exit register..')
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
        Guest.getPartyByLeader(guests[0].partyLeaderFirstName, guests[0].partyLeaderLastName, (err, gs) => {
          let itemsProcessed = 0
          gs.forEach(g => {
            let count = ++g.visitCount
            g = getPublicData(g)
            g.visitCount = count
            Guest.findOneAndUpdate({_id:g._id}, g, (err) => {
              console.log(err)
              if (err) throw err
              g.visitCount = undefined
              itemsProcessed++
              if (itemsProcessed === gs.length) {
                res.json({
                  success: true,
                  title: successTitle,
                  msg: guests[0].firstName + ', thanks for stopping in',
                  token: 'JWT '+token,
                  guests: gs
                })
              }
            })
          })
        })
        
      } else {
        return res.json({success: false, title: oopsTitle, msg: 'Invalid Email or Password'})
      }
    })
  })
})

router.post('/authenticate-facebook', (req, res, next) => {
  console.log('authenticate facebook..')
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
      Guest.getPartyByLeader(guest.partyLeaderFirstName, guest.partyLeaderLastName, (err, gs) => {
        let itemsProcessed = 0
        gs.forEach(g => {
          let count = ++g.visitCount
          g = getPublicData(g)
          g.visitCount = count
          Guest.findOneAndUpdate({_id:g._id}, g, (err) => {
            console.log(err)
            if (err) throw err
            g.visitCount = undefined
            itemsProcessed++
            if (itemsProcessed === gs.length) {
              res.json({
                success: true,
                title: successTitle,
                msg: guest.firstName + ', thanks for stopping in',
                token: 'JWT '+token,
                guests: gs
              })
            }
          })
        })
      })
    }
  })
  console.log('exit authenticate facebook..')
})

router.post('/update', passport.authenticate('jwt', {session:false}), (req, res, next) => {
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
  
  Guest.findOneAndUpdate({_id:guest._id}, guest, (err) => {
    console.log(err)
    if (err) {
      console.log(guest)
      res.json({success: false, title: errTitle, msg: 'Error saving changes'})
      throw err
    }
  })
  res.json({success: true, title: successTitle, msg: guest.firstName + '\'s changes have been saved', guest: guest})
  console.log('exit update..')
})

router.post('/forgot', (req, res, next) => {
  console.log('forgot password..')
  //send email
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      })
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
      })
      var mailOptions = {
        to: guests[0].email,
        from: 'passwordreset@lukeandamanda.life',
        subject: 'Luke & Amanda Wedding Site Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'https://lukeandamanda.life/reset/' + token + '\n\n' +
          'If you did not request this, please contact Luke or Amanda. Meanwhile, if you ignore this email, then your password will remain unchanged.\n'
      }
      smtpTransport.sendMail(mailOptions, function(err) {
        res.json({success: true, title: niceTitle, msg: 'Email sent to ' + guests[0].email + ' with further instructions', token: token})
        done(err, 'done');
      })
    }
  ], function(err) {
    if (err){
      res.json({success: false, title: errTitle, msg:'Failed to send password reset email'})
      throw err
    }
    res.json({success: true, title: niceTitle, msg: 'Email sent to ' + guest.email + ' with further instructions'})
  })
  console.log('exit forgot password..')
})

// router.get('/reset/:token', (req, res, next) => {
//   console.log('')
//     Guest.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, guest) {
//     if (!guest) {
//       res.json({success: false, title: errTitle, msg:'Password reset token is invalid or has expired'})
//     } else {
//       res.json({success: true, title: successTitle, msg:'Please set your new password'})
//     }
//   });
// })

router.post('/reset/:token', (req, res, next) => {
  console.log('reset password..')
  console.log(req.body)
  console.log(req.params.token)
  async.waterfall([
    function(done) {
      let itemsProcessed = 0
      Guest.findOne({ resetPasswordToken: req.params.token, resetPasswordTokenExpires: { $gt: Date.now() } }, function(err, guest) {
        if (!guest) {
          res.json({success: false, title: errTitle, msg: 'Password reset token is invalid or has expired'})
        } else {
          guest.unicorn = req.body.password
          guest.resetPasswordToken = ''
          guest.resetPasswordTokenExpires = new Date('1900-01-01')
          Guest.updateGuest(guest, done(err,guest))
        }
      })
    },
    function(guest, done) {
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
        to: guest.email,
        from: 'passwordreset@lukeandamanda.life',
        subject: 'Your password has been changed',
        text: 'Hi, ' + guest.firstName + '\n\n' +
          'This is a confirmation that the password for your account ' + guest.email + ' has just been changed.\n\n' +
          'See you back soon!\n\nLuke and Amanda'
      }
      smtpTransport.sendMail(mailOptions, function(err) {
        done(guest.email, err);
      })
    }
  ], function(email, err) {
      console.log('email', email)
      if (err){
        res.json({success: false, title: errTitle, msg:'Failed to reset password'})
        throw err
      } else {
        res.json({success: true, title: greatTitle, msg: 'Your password has been changed', email: email})
      }    
  })
  console.log('exit reset password..')
})

// Profile
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    console.log('profile..')
    console.log(req.user.partyLeaderFirstName)
    console.log(req.user.partyLeaderLastName)
    let itemsProcessed = 0
    Guest.find({ partyLeaderFirstName: req.user.partyLeaderFirstName, partyLeaderLastName: req.user.partyLeaderLastName }, 
      function(err, guests) {
        if (guests.length<1) {
          res.json({success: false, title: errTitle, msg: 'Failed to Retrieve Party'})
        }
        guests.forEach(guest => {
          let count = ++guest.visitCount
          
          guest = getPublicData(guest)
          guest.visitCount = count
          Guest.findOneAndUpdate({_id:guest._id}, guest, (err) => {
            console.log(err)
            if (err) throw err
            guest.visitCount = undefined
            itemsProcessed++
            if (itemsProcessed === guests.length) {
              res.json({success: true, title: niceTitle, msg: 'Found your Party', guests: guests})
            }
          })
        })
    })
    console.log('exit profile..')
})

router.post('/validate-email', (req, res, next) => {
  console.log('validate email..')
  console.log(req.body.email)

  Guest.findOne({email: req.body.email}, (err, guest) => {
    console.log(guest)
    if (err) throw err
    if (guest === null) {
      res.json({success: true})
    } else {
      res.json({success: false})
    }
  })
  console.log('exit validate email..')
})

function getPublicData(guest){
  console.log('get public data..')
  Object.keys(guest.toObject()).forEach(key => {
    if(privateFields.indexOf(key)>0){
        guest[key] = undefined
    }
  }) 
  return guest
}

router.get('/get-list-status', (req, res, next) => {
  console.log('get-list-status..')
  Guest.find({}, function (err, docs) {
    console.log('error', err)
    console.log('docs', docs)
    var fields = ['firstName', 'lastName', 'invite', 'inviteDate', 'rsvp', 'rsvpDate', 'mealOption', 'mealOptionDate', 'requestedSong', 'visitCount', 'facebookId', 'partyLeaderFirstName', 'partyLeaderLastName', 'address', 'phone', 'email'];
    var fieldNames = ['First Name', 'Last Name', 'Opened Invite', 'Date Invite Opened', 'RSVP', 'Date RSVP', 'Meal', 'Date Meal Selected', 'requestedSong', 'visitCount', 'facebookId', 'Party Leader First Name', 'Party Leader Last Name', 'Address', 'Phone', 'Email'];
    var data = json2csv({ data: docs, fields: fields, fieldNames: fieldNames });
    res.attachment('bearpoo-guests.csv');
    res.status(200).send(data);
  })
})

module.exports = router