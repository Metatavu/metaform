/*jshint esversion: 6 */
(function() {
  'use strict';

  const util = require('util');
  const _ = require('lodash');
  const request = require('request');
  
  class Webhook {
    
    static notify(settings, reply) {
      var queryParams = [];
      var params = settings.params||[];
      
      for (var i = 0; i < params.length; i++) {
        var param = params[i];
        
        if (param['in'] === 'query') {
          var value;
          
          if (_.startsWith(param.value, '[') && _.endsWith(param.value, ']')) {
            value = reply[param.value.substring(1, param.value.length - 1)];
          } else {
            value = param.value;
          }
          
          queryParams.push(util.format("%s=%s", param.name, encodeURIComponent(value)));
        }
      }
      
      var url = queryParams.length ? util.format('%s?%s', settings.url, queryParams.join('&')) : util.format('%s', settings.url);        
      request.get(url)
        .on('error', function(err) {
          console.error(err);
        });
    }
    
  }
  
  module.exports = Webhook;
  
}).call(this);