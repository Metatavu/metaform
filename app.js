/*jshint esversion: 6 */
/* global __dirname */

(function() {
  'use strict';
  
  const argv = require('minimist')(process.argv.slice(2));
  const http = require('http');
  const config = require('nconf');
  config.file({ file: argv.config || 'config.json' });
  const app = require(__dirname + '/index');
  
  http.createServer(app).listen(app.get('port'), function() {
      console.log('Express server listening on port ' + app.get('port'));
  });
  
}).call(this);
