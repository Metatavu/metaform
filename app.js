/*jshint esversion: 6 */
(function() {
  'use strict';
  
  const argv = require('minimist')(process.argv.slice(2));
  const express = require('express');
  const http = require('http');
  const path = require('path');
  const mongoose = require('mongoose');
  const bodyParser = require('body-parser');
  const expressSession = require('express-session');
  const cookieParser = require('cookie-parser');
  const expressValidator = require('express-validator');
  const flash = require('connect-flash');
  const passport = require('passport');
  const User = require(__dirname + '/model/user');
  const config = require(__dirname + '/config');
  const port = argv.port||3000;
  
  mongoose.connect('mongodb://' + config.database.host + '/' + config.database.table);
  require('./auth/passport')(passport);
  
  var app = express();
  
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');
  
  app.use(cookieParser());
  app.use(expressSession({secret:config.session_secret}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  app.set('port', port);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended : true
  }));
  app.use(expressValidator());
  
  require('./routes')(app);
  
  User.findOne({
    role: 'admin'
  }).then((admin) => {
    if (!admin) {
      var newAdmin = new User();
      newAdmin.email = config.admin.email;
      newAdmin.password = newAdmin.generateHash(config.admin.password);
      newAdmin.role = 'admin';
      newAdmin.save().then(() => {
        console.log('Created admin user');
      }).catch((err) => {
        console.error('Error creating admin user', err);
      }); 
    } else {
      admin.email = config.admin.email;
      admin.password = admin.generateHash(config.admin.password);
      admin.archived = false;
      admin.save().then(() => {
        console.log('Admin user updated');
      }).catch((err) => {
        console.error('Error updating admin user', err);
      });
    }
  }).catch((err) => {
    console.error(err);
  });

  http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
  });
  
}).call(this);