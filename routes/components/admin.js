/*jshint esversion: 6 */
/* global __dirname */

(function () {
  'use strict';

  const Form = require(__dirname + '/../../form');
  const moment = require('moment');
  const xlsx = require('node-xlsx');
  const util = require('util');
  const pdf = require('html-pdf');
  const config = require('nconf');
  
  exports.renderAdminView = (req, res) => {
    const includeFiltered = req.query.includeFiltered == "true";
    const allowDeletion = config.get('allow-deletion') || false;
    Form.listReplies(req.metaform.token, includeFiltered, (err, replies) => {
      if (err) {
        console.error(err);
        res.status(500).send(err);
      } else {
        res.render('admin', { 
          title: 'Hallintapaneeli',
          user: req.user,
          viewModel: Form.viewModel(),
          fields: Form.contextFields('MANAGEMENT_LIST'),
          metafields: Form.metaFields('MANAGEMENT_LIST'),
          replies: replies,
          includeFiltered: includeFiltered,
          allowDeletion: allowDeletion
        });
      }
    });
  };

  exports.renderUserManagementView = (req, res) => {
    res.render('usermanagement', { 
      user: req.user,
      viewModel: Form.viewModel()
    });
  };
  
  exports.getFormReply = (req, res) => {
    const id = req.params.id;
    const format = req.query.format;
    
    Form.loadReply(id, (err, formReply) => {
      if (err) {
        res.status(500).send(err);
      } else {
        if (format === 'pdf') {
          res.render('form-reply-print', {
            title: 'Vastaus',
            user: req.user,
            viewModel: Form.adminViewModel(formReply),
            metafields: Form.metaFields('MANAGEMENT'),
            formReply: formReply
          }, function(err, html) {
            res.header("Content-Type", "application/pdf");
            pdf.create(html, {'border': '1cm'}).toStream(function(err, pdfStream){
              pdfStream.pipe(res);
            });
          });
        } else {
          res.render('form-reply', {
            title: 'Vastaus',
            user: req.user,
            viewModel: Form.adminViewModel(formReply),
            metafields: Form.metaFields('MANAGEMENT'),
            formReply: formReply
          });
        }
      }
    });
  };
  
  exports.getFields = (req, res) => {
    res.send(Form.dataFields());
  };

  exports.deleteReply = (req, res) => {
    if (!config.get('allow-deletion')) {
      res.status(405).send();
      return;
    }
    
    const id = req.params.id;
    Form.deleteReply(id, (err) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(204).send();
      }
    });
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
