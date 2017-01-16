var config = require('../config');
var mailgun = require('mailgun-js')({apiKey: config.mail.api_key, domain: config.mail.domain});
var sender = config.mail.sender+'@'+config.mail.domain;

exports.sendMail = function(to, subject, text, callback) {
  mailgun.messages().send({
    from: sender,
    to: to,
    subject: subject,
    html: text
  }, function (error, body) {
    if(typeof(callback) == 'function') {
      callback(error, body);
    }
  });
};