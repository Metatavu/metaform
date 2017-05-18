/*jshint esversion: 6 */
/* global __dirname */

(function() {
  'use strict';
    
  const util = require('util');
  const mongoose = require('mongoose');
  const async = require('async');
  const _ = require('underscore');
  const FileMeta = require(__dirname + '/../model/filemeta');
  const config = require('nconf');
  const NOT_SAVED_FIELDS = ['logo', 'submit', 'small-text', 'html'];
  
  class Form {
    
    static config() {
      return require(util.format(__dirname + '/../%s.json', config.get('form')));
    }
    
    static viewModel() {
      var formConfig = Form.config();
      return {
        "title": formConfig.title,
        "theme": formConfig.theme,
        "sections": formConfig.sections
      }
    }
    
    static get notifications() {
      var formConfig = Form.config();
      return formConfig.notifications||[];
    }
    
    static getReplyEmail(reply) {
      var formConfig = Form.config();
      if (formConfig['email-field']) {
        return reply[formConfig['email-field']];
      }
      
      return null;
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
    
    static listFilterFields() {
      return _.filter(Form.contextFields('MANAGEMENT_LIST'), (field) => {
        return field['list-filter'];
      });
    }
    
    static fields() {
      var fields = [];
      var config = Form.config();
      
      for (let i = 0; i < config.sections.length; i++) {
        var section = config.sections[i];
        var sectionFields = section.fields;
        for (let j = 0; j < sectionFields.length; j++) {
          var field = sectionFields[j];
          field.visibilityRules = [];
          if (section['visible-if']) {
            field.visibilityRules.push(section['visible-if']);
          }
          if (field['visible-if']) {
            field.visibilityRules.push(field['visible-if']);
          }

          fields.push(field);
        }
        
      } 
      
      return fields;
    }
    
    static dataFields() {
      var result = [];
      var config = Form.config();
      
      var sectionNames = Object.keys(config.sections);
      
      for (let i = 0; i < sectionNames.length; i++) {
        let sectionName = sectionNames[i];
        let fields = config.sections[sectionName].fields;
        for (let j = 0; j < fields.length; j++) {
          if (NOT_SAVED_FIELDS.indexOf(fields[j].type) === -1) {
            result.push(fields[j]);
          } 
        }
      } 
      
      return result;
    }
    
    static validateFieldVisibilityRule(req, rule) {
      var isVisible = false;
      var analyzed = false;

      if (typeof(rule.field) !== 'undefined') {
        var valueSet = Form.isValueSet(req, rule.field);
        var fieldValue = valueSet ? req.body[rule.field] : null;

        analyzed = true;
        
        if (rule.equals === true) {
          isVisible = valueSet;
        } else if (rule.equals) {
          isVisible = rule.equals === fieldValue;
        } else if (rule['not-isVisible'] === true) {
          isVisible = !valueSet;
        } else if (rule['not-isVisible']) {
          isVisible = rule['not-isVisible'] !== fieldValue;
        }
      }

      if (Array.isArray(rule.and)) {
        var andResult = true;
        for (let i = 0; i < rule.and.length; i++) {
          var andSubRule = rule.and[i];
          andResult = andResult && Form.validateFieldVisibilityRule(req, andSubRule);
          if (!andResult) {
            break;
          }
        }
        isVisible = analyzed ? isVisible && andResult : andResult;
      }

      if (Array.isArray(rule.or)) {
        var orResult = false;
        for (let j = 0; j < rule.or.length; j++) {
          var orSubRule = rule.or[j];
          orResult = orResult || Form.validateFieldVisibilityRule(req, orSubRule);
          if (orResult) {
            break;
          }
        }
        isVisible = analyzed ? isVisible || orResult : orResult;
      }
      
      return isVisible;
    }
    
    static validateFieldVisibilityRules(req, field) {
      for(let i = 0; i < field.visibilityRules.length; i++) {
        var rule = field.visibilityRules[i];
        if (!Form.validateFieldVisibilityRule(req, rule)) {
          return false;
        }
      }
      
      return true;
    }
    
    static validateRequest(req) {
      var fields = Form.fields();
      
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];

        if (field.required && Form.validateFieldVisibilityRules(req, field)) {
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
            case 'select':
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
            case 'checklist':
            case 'files':
              data[field.name] = req.body[field.name];
            break;
            case 'table':
              data[field.name] = JSON.parse(req.body[field.name]);
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
          var schemaType = Form.resolveSchemaType(field);
          var schemaField = {
            type: schemaType
          };
    
          if (field.type === 'radio' || field.type === 'select') {
            schemaField.enum = [null].concat(Form.resolveFieldOptions(field));
            schemaField.default = Form.resolveFieldDefaultOption(field);
          }          
  
          schemaOptions[field.name] = schemaField;
        }
      }

      schemaOptions['created'] = Date;
      schemaOptions['modified'] = Date;
      
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
    
    static createReply(data, callback) {
      var FormReplyModel = Form.replyModel();      
      var reply = new FormReplyModel(_.extend(data, {
        created: new Date(),
        modified: new Date()
      }));
      
      reply.save(callback); 
    }
    
    static updateReply(id, data, callback) {
      Form.replyModel().findById(id, (loadErr, formReply) => {
        if (loadErr) {
          callback(loadErr);
        } else {
          if (!formReply) {
            callback('Could not find a form');
          } else {
            formReply = _.extend(_.extend(formReply, data), {
              modified: new Date()  
            });
            
            formReply.save(callback);
          }
        }
      });
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
    
    static listReplies(includeFiltered, callback) {
      var query = {};
      
      if (!includeFiltered) {
        var filterFields = Form.listFilterFields();
        if (filterFields && filterFields.length) {
          for (var i = 0; i < filterFields.length; i++) {
            var filterField = filterFields[i];
            if (filterField.type == 'radio') {
              var excludeValues = 
                _.filter(filterField.options, (option) => {
                  return option['filter-exclude'];
                })
                .map((option) => {
                  return option.name;
                });
              
              query[filterField.name] = {
                "$nin": excludeValues
              };
            }
          }
        }
      }
      
      Form.replyModel().find(query)
        .sort({ 
          modified: -1 
        })
        .batchSize(2000)
        .exec(callback);
    }
        
    static resolveSchemaType (field) {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'memo':
        case 'radio':
        case 'time':
        case 'select':
          return String;
        case 'date':
          return Date;
        case 'checklist':
          return [ String ];
        case 'number':
          return Number;
        case 'boolean':
          return Boolean;
        case 'files':
          return [ mongoose.Schema.Types.ObjectId ];
        case 'table':
          var tableDef = {};
          _.each(field.columns, (column) => {
            tableDef[column.name] = {
              "type": this.resolveTableSchemaType(column.type)
            }
          });
          return [ tableDef ];
        default:
        break;
      } 
      
      return null;
    }
    
    static resolveTableSchemaType (type) {
      switch (type) {
        case 'text':
        case 'enum':
        case 'time':
          return String;
        case 'number':
          return Number;
        case 'date':
          return Date;
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