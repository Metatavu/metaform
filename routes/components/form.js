/*jshint esversion: 6 */
(function() {
  'use strict';
  
  var Form = require(__dirname + '/../../form');
  var FormReplyModel = Form.replyModel();
  var pug = require('pug');
  var mailer = require('../../services/mailer');
  var _ = require('underscore');
  
  function sendEmail(reply) {
    var email = Form.getReplyEmail(reply);
    if (email) {
      try {
        var emailContent = pug.renderFile(util.format('%s/../../views/mail.pug', __dirname), { 
          viewModel: Form.viewModel(),
          reply: reply
        });
        
        mailer.sendMail(email, 'Lomake vastaanotettu.', emailContent);
      } catch(renderEx){
        console.error(renderEx)
      }   
    }
  }
  
  exports.postReply = (req, res) => {
    var id = req.body.id;
    var data = req.body.data;
    
    FormReplyModel.findById(id, (err, form) => {
      if (err) {
        res.status(400).send(err);
      } else {
        form = _.extend(form, data);
        form.save((err, form) => {
          if (err) {
            res.status(400).send(err);
          } else {
            res.send(form);
          }
        });  
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
      var reply = new FormReplyModel(body);

      reply.save((err, reply) => {
        if (err) {
          console.error(err);
          res.status(400).send(err);
        } else {
          sendEmail(reply);
          res.send(reply);
        }
      });
    }
  };
  
}).call(this);