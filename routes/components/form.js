/*jshint esversion: 6 */
/* global __dirname */

(function() {
  'use strict';
  
  const util = require('util');
  const Form = require(__dirname + '/../../form');
  const Notifications = require(__dirname + '/../../notifications');
  
  exports.putReply = (req, res) => {
    const id = req.params.id;
    const body = Form.sanitizedBody(req);
    const data = {};
    const fields = Form.contextFields('MANAGEMENT');
    
    for (let i = 0; i < fields.length; i++) {
      let field = fields[i];
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
          res.send(reply);
        }
      });
    }
  };
  
}).call(this);