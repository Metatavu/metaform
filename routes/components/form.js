/*jshint esversion: 6 */
(function() {
  'use strict';
  
  const util = require('util');
  const Form = require(__dirname + '/../../form');
  const User = require('../../model/user');
  const pug = require('pug');
  const mailer = require('../../services/mailer');
  const Notifications = require(__dirname + '/../../notifications');
  
  function sendSenderEmail(reply) {
    var email = Form.getReplyEmail(reply);
    if (email) {
      try {
        var emailContent = pug.renderFile(util.format('%s/../../views/mails/received.pug', __dirname), { 
          viewModel: Form.viewModel(),
          reply: reply
        });
     
        mailer.sendMail(email, 'Lomake vastaanotettu.', emailContent);
      } catch(renderEx){
        console.error(renderEx)
      }   
    }
  }
  
  function sendManagerEmail(email) {
    try {
      var viewModel = Form.viewModel();
      var emailContent = pug.renderFile(util.format('%s/../../views/mails/received-manager.pug', __dirname), { 
        viewModel: viewModel
      });

      mailer.sendMail(email, util.format('Uusi vastaus lomakkeessa %s', viewModel.title), emailContent);
    } catch(renderEx){
      console.error(renderEx)
    }   
  }
  
  exports.putReply = (req, res) => {
    var id = req.params.id;
    var body = Form.sanitizedBody(req);
    var data = {};
    var fields = Form.contextFields('MANAGEMENT');
    
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (field.editable) {
        data[field.name] = body[field.name];
      }
    }
    
    Form.updateReply(id, data, (err) => {
      if (err) {
        res.status(500).send(util.format("Lomakkeen tallennuksessa tapahtui virhe: %s", err));
      } else {
        res.status(200).send("OK");
      }
    });
  };
  
  exports.postReply = (req, res) => {
    Form.validateRequest(req);
    var errors = req.validationErrors();
    if (errors) {
      console.error(errors);
      res.status(400).send(errors);
    } else {
      var body = Form.sanitizedBody(req);
      Form.createReply(body, (err, reply) => {
        if (err) {
          console.error(err);
          res.status(400).send(err);
        } else {
          Notifications.notify(Form.notifications, reply);
          
          sendSenderEmail(reply);
          
          User.find({
            archived: false
          }, (err, users) => {
            if (!err){
              for (var i = 0; i < users.length; i++) {
                sendManagerEmail(users[i].email);
              }
            } else {
              console.error(err);
            }
          });
          
          res.send(reply);
        }
      });
    }
  };
  
}).call(this);