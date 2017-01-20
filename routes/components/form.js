/*jshint esversion: 6 */
(function() {
  'use strict';
  
  var Form = require(__dirname + '/../../form');
  var FormReplyModel = Form.replyModel();
  var FileMeta = require('../../model/filemeta');
  var pug = require('pug');
  var mailer = require('../../services/mailer');
  var config = require('../../config');
  var async = require('async');
  var _ = require('underscore');
  
  exports.getForm = (req, res) => {
    var id = req.params.id;
    
    FormReplyModel.findById(id, (err, form) => {
      if (err) {
        res.status(404).send();
      } else {
        var appendices = [];
        async.each(form.appendices||[], (appendixId, callback) => {
          Appendix.findById(appendixId, (err, appendix) => {
            if (err) {
              callback(err);
            } else {
              appendices.push(appendix);
              callback();
            }
          })
        }, (err) => {
          if (err) {
            res.status(500).send();
          }
          
          res.render('form', {form: form, appendices: appendices, positions: config.positions, root: config.server_root});
        }); 
      }
    });
  };
  
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
      console.log(errors);
      res.status(400).send(errors);
    } else {
      var body = Form.sanitizedBody(req);
      var model = new FormReplyModel(body);

      model.save((err, model) => {
        if (err) {
          console.error(err);
          res.status(400).send(err);
        } else {
          /**
          TODO: Email

          var emailContent = null;
          try {
            emailContent = pug.renderFile(util.format('%s/../../views/mail.pug', __dirname), { form: model });
          } catch(renderEx){
            console.log(renderEx)
          }   
          
          mailer.sendMail(form.email, 'Kesätyöhakemuksesi on vastaanotettu.', content);
          **/
          
          res.send(model);
        }
      });
    }
  };
}).call(this);