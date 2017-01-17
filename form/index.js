/*jshint esversion: 6 */
(function() {
  'use strict';
    
  const util = require('util');
  const mongoose = require('mongoose');
  const _ = require('underscore');
  const config = require(__dirname + '/../config.js');
  
  class Form {
    
    static config() {
      return require(util.format(__dirname + '/../forms/%s.json', config.form));
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

    static sanitizedBody(req) {
      var data = {};
      var fields = Form.fields();
      
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        
        switch (field.type) {
          case 'number':
            data[field.name] = req.sanitizeBody(field.name).toInt();
          break;
          case 'email':
            data[field.name] = req.sanitizeBody(field.name).toEmail();
          break;
          case 'boolean':
            data[field.name] = req.sanitizeBody(field.name).toBoolean();
          break;
          default:
            data[field.name] = req.sanitizeBody(field.name);
          break;
        }
      }
      
      return data;
    }
    
    static model() {
      var fields = Form.fields();
      
      var schema = {};
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        var fieldType = field.type;
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
  
        schema[field.name] = schemaField;
      }
      
      return new mongoose.Schema(schema);
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