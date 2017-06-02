/*jshint esversion: 6 */
/* global __dirname */

(function() {
  'use strict';
  
  const util = require('util');
  const Webhook = require(__dirname + '/webhook.js');
  const ManagerEmail = require(__dirname + '/manager-email.js');
  const ClientEmail = require(__dirname + '/client-email.js');
  
  class Notifications {
    
    static notify(notifications, reply) {
      for (var i = 0; i < notifications.length; i++) {
        switch (notifications[i].type) {
          case 'webhook':
            Webhook.notify(notifications[i], reply);
          break;
          case 'manager-email':
            ManagerEmail.notify(notifications[i], reply);
          break;
          case 'client-email':
            ClientEmail.notify(notifications[i], reply);
          break;
          default:
            console.error(util.format('Unknown notification type %s', notifications[i].type));
          break;
        }
      }
    }
    
  }
  
  module.exports = Notifications;
  
}).call(this);