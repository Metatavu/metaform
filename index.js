/*jshint esversion: 6 */
/* global __dirname */

(function() {
  'use strict';
  
  const argv = require('minimist')(process.argv.slice(2));
  const express = require('express');
  const path = require('path');
  const mongoose = require('mongoose');
  const bodyParser = require('body-parser');
  const expressSession = require('express-session');
  const MongoStore = require('connect-mongo');
  const cookieParser = require('cookie-parser');
  const expressValidator = require('express-validator');
  const flash = require('connect-flash');
  const passport = require('passport');
  const config = require('nconf');
  const Keycloak = require('keycloak-connect');
  const util = require('util');
  
  const User = require(__dirname + '/model/user');
  const port = argv.port||3000;
  const connectionUrl = `mongodb://${config.get('database:user')}:${config.get('database:pass')}@${config.get('database:host')}/${config.get('database:table')}?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority`;

  const app = express();
  const http = require('http-shutdown')(require('http').Server(app));

  mongoose.connect(connectionUrl)
    .then(() => {
      console.log('Connected to MongoDB');

      require('./auth/passport')(passport);
      
      app.set('views', path.join(__dirname, 'views'));
      app.set('view engine', 'pug');
      
      app.use(cookieParser());

      const sessionStore = MongoStore.create({ mongoUrl: connectionUrl });
      
      app.use(expressSession({
        secret: config.get('session_secret'),
        store: sessionStore
      }));
      
      let keycloak = null;
      if (config.get('authProvider') === 'keycloak') {
        
        keycloak = new Keycloak({ store: sessionStore}, {
          "realm": config.get('keycloak:realm'),
          "auth-server-url": config.get('keycloak:admin:baseUrl'),
          "ssl-required": "external",
          "resource": config.get('keycloak:client'),
          "public-client": true,
          "use-resource-role-mappings": true
        });
        
        app.use(keycloak.middleware({
          logout: '/logout',
          admin: '/admin'
        })); 
        
        app.locals.keycloakAccountUrl = keycloak.accountUrl();
      }
      
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
      
      app.locals.metaformMode = config.get('mode') || 'production';
      app.locals.moment = require('moment');
      
      require(__dirname + '/websocket')(http);
      require('./routes')(app, keycloak);
      
      User.findOne({
        email: config.get('admin:email')
      }).then((admin) => {
        if (!admin) {
          const newAdmin = new User();
          newAdmin.email = config.get('admin:email');
          newAdmin.password = newAdmin.generateHash(config.get('admin:initialPassword'));
          newAdmin.role = 'admin';
          newAdmin.save().then(() => {
            console.log('Created admin user');
          }).catch((err) => {
            console.error('Error creating admin user', err);
          }); 
        }
      }).catch((err) => {
        console.error(err);
      });
    })
    .catch((err) => {
      console.error('Error connecting to MongoDB', err);
    });
  
  exports.startServer = (callback) => {
    const port = app.get('port') || 3000;
    
    http.listen(port, function () {
      callback(port);
    });
  };
  
  exports.close = (callback) => {
    http.shutdown(callback);
  };
  
}).call(this);