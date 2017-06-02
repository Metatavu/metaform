/*jshint esversion: 6 */
/* global __dirname */

(function() {
  'use strict';
  
  const argv = require('minimist')(process.argv.slice(2));
  const http = require('http');
  const config = require('nconf');
  config.file({ file: argv.config || 'config.json' });
  const app = require(__dirname + '/index');
  
  app.startServer(() => {
    console.log('Express server started');
  });
  
}).call(this);
