/*jshint esversion: 6 */
(function() {
  'use strict';
    
  const util = require('util');
  const mongoose = require('mongoose');
  const _ = require('underscore');
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
    
    static reportListFields() {
      var fields = Form.fields();
      var result = [];
      
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        if (field.listInReport) {
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
    
    static model() {
      if (Form._model) {
        return Form._model;
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
          }          
  
          schemaOptions[field.name] = schemaField;
        }
      }
      
      var schema = new mongoose.Schema(schemaOptions);
      Form._model = mongoose.model('Form', schema);
      
      return Form._model;
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
    
  }
  
  module.exports = Form;
  
}).call(this);