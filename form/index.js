/*jshint esversion: 6 */
(function() {
  'use strict';
    
  const util = require('util');
  const mongoose = require('mongoose');
  const async = require('async');
  const _ = require('underscore');
  const FileMeta = require(__dirname + '/../model/filemeta');
  const config = require(__dirname + '/../config.js');
  const NOT_SAVED_FIELDS = ['logo', 'submit', 'small-text'];
  
  class Form {
    
    static config() {
      return require(util.format(__dirname + '/../%s.json', config.form));
    }
    
    static viewModel() {
      var formConfig = Form.config();
      return {
        "title": formConfig.title,
        "theme": formConfig.theme,
        "sections": formConfig.sections
      };
    }
    
    static contextFields(context) {
      var fields = Form.fields();
      var result = [];
      
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        if ((field.contexts||[]).indexOf(context) > -1) {
          result.push(field);
        }
      }
      
      return result;
    }
    
    static fields() {
      var fields = [];
      var config = Form.config();
      
      var sectionNames = Object.keys(config.sections);
      
      for (var i = 0; i < sectionNames.length; i++) {
        var sectionName = sectionNames[i];
        fields = fields.concat(config.sections[sectionName].fields);
      } 
      
      return fields;
    }
    
    static validateRequest(req) {
      var fields = Form.fields();
      
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];

        if (field.required) {
          req.checkBody(field.name, util.format("Syötä %s", field.title)).notEmpty();
        }
        
        if (Form.isValueSet(req, field.name)) {
          switch (field.type) {
            case 'number':
              req.checkBody(field.name, util.format("%s ei ole numero", field.title)).isInt()
            break;
            case 'email':
              req.checkBody(field.name, util.format("%s ei ole sähköpostiosoite", field.title)).isEmail()
            break;
            case 'boolean':
              req.checkBody(field.name, util.format("%s on väärin muotoiltu", field.title)).isBoolean();
            break;
            case 'radio':
              var options = Form.resolveFieldOptions(field);
              req.checkBody(field.name, util.format("%s ei ole joukossa %s", field.title, options.join(','))).isIn(options);
            break;
            default:
            break;
          }
        } 
      }
    }

    static sanitizedBody(req) {
      var data = {};
      var fields = Form.fields();
      
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        if (Form.isValueSet(req, field.name)) {
          switch (field.type) {
            case 'number':
              data[field.name] = req.sanitizeBody(field.name).toInt();
            break;
            case 'boolean':
              data[field.name] = req.sanitizeBody(field.name).toBoolean();
            break;
            case 'files':
              data[field.name] = req.body[field.name];
            break;
            default:
              data[field.name] = req.sanitizeBody(field.name);
            break;
          }
        }
      }
      
      return data;
    }
    
    static isValueSet(req, name) {
      var value = req.body[name];
      return value !== undefined && value !== null && value !== '';
    }
    
    static replyModel() {
      if (Form._replyModel) {
        return Form._replyModel;
      }
      
      var fields = Form.fields();
      
      var schemaOptions = {};
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        var fieldType = field.type;
        var skip = NOT_SAVED_FIELDS.indexOf(fieldType) > -1;
        
        if (!skip) {
          var schemaType = Form.resolveSchemaType(fieldType);
          var schemaField = {
            type: schemaType
          };
          
          if (field.required) {
            schemaField.required = true;
          }
    
          if (field.type === 'radio') {
            schemaField.enum = Form.resolveFieldOptions(field);
            schemaField.default = Form.resolveFieldDefaultOption(field);
          }          
  
          schemaOptions[field.name] = schemaField;
        }
      }
      
      var schema = new mongoose.Schema(schemaOptions);
      Form._replyModel = mongoose.model('Reply', schema);
      
      return Form._replyModel;
    }
    
    static createFileMetaLoad (fieldName, id) {
      return (callback) => {
        FileMeta.findById(id, (err, meta) => {
          if (err) {
            callback(err);
          } else {
            callback(null, {
              fieldName: fieldName,
              fileMeta: meta
            });
          }
        });
      }
    }
    
    static loadReply(id, callback) {
      Form.replyModel().findById(id).lean().exec((err, formReply) => {
        if (err) {
          callback(err);
        } else {
          var fields = Form.fields();
          var fileLoads = [];
          
          for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (field.type == 'files') {
              var fileIds = (formReply[field.name] || []);
              fileLoads = fileLoads.concat(fileIds.map((fileId) => {
                return this.createFileMetaLoad(field.name, fileId);
              }));
            }
          }
          
          async.parallel(fileLoads, (fileErr, fileMetaResponses) => {
            if (fileErr) {
              callback(fileErr);
            } else {
              var result = formReply;
              var fieldMetas = {};
              
              for (var i = 0; i < fileMetaResponses.length; i++) {
                var fileMetaResponse = fileMetaResponses[i];
                var fileMeta = fileMetaResponse.fileMeta;
                var fileMetas = fieldMetas[fileMetaResponse.fieldName] || [];
                console.log("Meat files", fileMetas);
                fieldMetas[fileMetaResponse.fieldName] = fileMetas.concat([fileMeta]);
              }
              
              for (var j = 0; j < fields.length; j++) {
                if (fields[j].type == 'files') {
                  result[fields[j].name] = fieldMetas[fields[j].name];
                }
              }
              
              callback(null, result);
            }
          });
        }
      });
    }
        
    static resolveSchemaType (fieldType) {
      switch (fieldType) {
        case 'text':
        case 'email':
        case 'memo':
        case 'radio':
          return String;
        case 'number':
          return Number;
        case 'boolean':
          return Boolean;
        case 'files':
          return [ mongoose.Schema.Types.ObjectId ];
        default:
        break;
      } 
      
      return null;
    }
    
    static resolveFieldOptions(field) {
      return _.map(field.options, (option) => {
        return option.name;
      });
    }
    
    static resolveFieldDefaultOption(field) {
      for (var i = 0; i < field.options.length; i++) {
        if (field.options[i].checked) {
          return field.options[i].name;
        }
      }
      
      return null;
    }
    
  }
  
  module.exports = Form;
  
}).call(this);