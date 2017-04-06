/*jshint esversion: 6 */
(function() {
  'use strict';
  
  const util = require('util');
  const Webhook = require('./webhook.js');
  
  class Notifications {
    
    static notify(notifications, reply) {
      for (var i = 0; i < notifications.length; i++) {
        if (notifications[i].type === 'webhook') {
          Webhook.notify(notifications[i], reply);
        } else {
          console.error(util.format('Unknown notification type %s', notifications[i].type));
        }
      }
    }
    
  }
  
  module.exports = Notifications;
  
}).call(this);