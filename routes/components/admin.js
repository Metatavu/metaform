/*jshint esversion: 6 */
/* global __dirname */

(function () {
  'use strict';

  const Form = require(__dirname + '/../../form');
  const moment = require('moment');
  const xlsx = require('node-xlsx');
  const util = require('util');
  
  exports.renderAdminView = function (req, res) {
    const includeFiltered = req.query.includeFiltered == "true";
    Form.listReplies(req.metaform.token, includeFiltered, (err, replies) => {
      if (err) {
        res.status(500).send();
      } else {
        res.render('admin', { 
          title: 'Hallintapaneeli',
          user: req.user,
          viewModel: Form.viewModel(),
          fields: Form.contextFields('MANAGEMENT_LIST'),
          replies: replies,
          includeFiltered: includeFiltered
        });
      }
    });
  };

  exports.renderUserManagementView = function(req, res){
    res.render('usermanagement', { 
      user: req.user,
      viewModel: Form.viewModel()
    });
  };
  
  exports.getFormReply = (req, res) => {
    const id = req.params.id;
    
    Form.loadReply(id, (err, formReply) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.render('form-reply', {
          title: 'Vastaus',
          user: req.user,
          viewModel: Form.adminViewModel(formReply),
          formReply: formReply
        });
      }
    });
  };
  
  exports.getFields = (req, res) => {
    res.send(Form.dataFields());
  };
  
  exports.createXlsx = (req, res) => {
    const includeFiltered = req.query.includeFiltered == "true";
    Form.listReplies(req.metaform.token, includeFiltered, (err, replies) => {
      if (err) {
        res.status(500).send();
      } else {
        const fields = Form.dataFields();
        const rows = [];
        const header = [];
        const fieldNames = req.query.fields.split(',');
        for (let i = 0; i < fieldNames.length; i++) {
          for (let j = 0; j < fields.length;j++) {
            if (fieldNames[i] === fields[j].name) {
              header.push(fields[j].title);
              break;
            } 
          }
        }
        rows.push(header);

        for (let i = 0; i < replies.length; i++) {
          const row = [];
          const reply = replies[i].toObject();
          for (let j = 0; j < fieldNames.length; j++) {
            const replyField = reply[fieldNames[j]];
            if (typeof(replyField) === 'undefined') {
              row.push('');
            } else if (fieldNames[j] === 'attachments') {
              row.push(util.format('%d kpl', replyField.length));
            } else if (typeof(replyField) === 'object') {
              if (Array.isArray(replyField)) {
                if(replyField[0] && typeof(replyField[0]) === 'object') {
                  row.push(stringifyObjects(replyField));
                } else {
                  row.push(replyField.join(', ')); 
                }
              } else {
                if (moment.isDate(replyField)) {
                 row.push(moment(replyField).format('DD.MM.YYYY'));
                } else {
                 row.push(stringifyObject(replyField)); 
                }
              }
            } else {
              row.push(replyField);
            }
          }
          rows.push(row);
        }
        const buffer = xlsx.build([{name: 'Hakemukset', data: rows}]);
        res.setHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
      }
    });
  };

  function stringifyObjects(objects) {
    const result = objects.map((o) => {
      return stringifyObject(o);
    });
    
    return result.join(' / ');
  }

  function stringifyObject(object) {
    const result = [];
    const keys = Object.keys(object);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].startsWith('_')) {
        continue;
      }
      result.push(util.format('%s: %s', keys[i], object[keys[i]]));
    }
    
    return result.join(', ');
  }

}).call(this);
