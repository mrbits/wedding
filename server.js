const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
const http = require('http');
const https = require('https');
const fs = require('fs');

const httpsOptions = {
  ca: fs.readFileSync('/etc/ssl/certs/lukeandamanda_life.ca-bundle'),
  key: fs.readFileSync('/etc/ssl/private/lukeandamanda_life.key'),
  cert: fs.readFileSync('/etc/ssl/certs/lukeandamanda_life.crt')
};

// Connect To Database
mongoose.connect(config.database);

// On Connection
mongoose.connection.on('connected', () => {
  console.log('Connected to database '+config.database);
});

// On Error
mongoose.connection.on('error', (err) => {
  console.log('Database error: '+err);
});

const app = express();

const guests = require('./routes/guests');
  
// Port Number
const port = process.env.PORT || 3000;

// CORS Middleware
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'dist')));

// Body Parser Middleware
app.use(bodyParser.json());

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.use('/api/guest', guests);

// Start Server
app.listen(port, () => {
  console.log('Server started on port '+port);
});
app.all('*', ensureSecure);

http.createServer(app).listen(3000);
var appSecure = https.createServer(httpsOptions, app).listen(8443);

app.get('*',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

appSecure.listen(8443);

function ensureSecure(req, res, next){
  if(req.secure){
    // OK, continue
    return next();
  };
  // handle port numbers if you need non defaults
  res.redirect('https://' + req.hostname + req.url); // express 4.x
}
