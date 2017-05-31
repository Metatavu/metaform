/*jshint esversion: 6 */
/* global __dirname */

(() => {
  'use strict';
  
  const Form = require(__dirname + '/../form');
  const pug = require('pug');
  const mailer = require(__dirname + '/../services/mailer');
  const util = require('util');
  
  class ClientEmail { 
    static notify(settings, reply) {
      const email = Form.getReplyEmail(reply);
      if (email) {
        try {
          var emailContent = pug.renderFile(util.format('%s/../views/mails/received.pug', __dirname), { 
            viewModel: Form.viewModel(),
            reply: reply
          });

          mailer.sendMail(email, 'Lomake vastaanotettu.', emailContent);
        } catch(renderEx){
          console.error("Error rendering client email notification", renderEx);
        }   
      }
    }
  }
  
  module.exports = ClientEmail;
  
})();