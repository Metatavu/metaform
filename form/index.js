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
  const moment = require('moment');
  
  class Form {
    
    static config() {
      return JSON.parse(JSON.stringify(require(util.format(__dirname + '/../%s.json', config.get('form')))));
    }
    
    static metaFields(context) {
      const formConfig = Form.config();
      const metaFields = formConfig.metafields || [];
      return _.filter(metaFields, (field) => {
        return (field.contexts||[]).indexOf(context) > -1;
      });
    }
    
    static viewModel() {
      const formConfig = Form.config();
      return {
        "title": formConfig.title,
        "theme": formConfig.theme,
        "sections": formConfig.sections
      }
    }
    
    static adminViewModel(reply) {
      const formConfig = Form.config();
      formConfig.sections = _.filter(formConfig.sections, (section) => {
        if (!section['visible-if']) {
          return true;
        }

        return Form.validateFieldVisibilityRule(reply, section['visible-if']);
      });
      
      for (let i = 0; i < formConfig.sections.length; i++) {
        const section = formConfig.sections[i];
        const sectionFields = section.fields;
        section.fields = _.filter(section.fields, (field) => { 
          if (!field['visible-if']) {
            return true;
          }

          return Form.validateFieldVisibilityRule(reply, field['visible-if']); 
        });
      }
      
      return {
        "title": formConfig.title,
        "theme": formConfig.theme,
        "sections": formConfig.sections
      };
    }
    
    static get notifications() {
      return Form.config().notifications||[];
    }
    
    static getReplyEmail(reply) {
      const formConfig = Form.config();
      if (formConfig['email-field']) {
        return reply[formConfig['email-field']];
      }
      
      return null;
    }
    
    static contextFields(context) {
      const fields = Form.fields();
      const result = [];
      
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
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

    static listTargetingFields() {
      return _.filter(Form.fields(), (field) => {
        return field['manager-targeting'];
      });
    }
    
    static fields() {
      const fields = [];
      const config = Form.config();
      
      for (let i = 0; i < config.sections.length; i++) {
        const section = config.sections[i];
        const sectionFields = section.fields;
        for (let j = 0; j < sectionFields.length; j++) {
          let field = sectionFields[j];
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
      const result = [];
      const config = Form.config();
      
      for (let i = 0; i < config.sections.length; i++) {
        let fields = config.sections[i].fields;
        for (let j = 0; j < fields.length; j++) {
          if (NOT_SAVED_FIELDS.indexOf(fields[j].type) === -1) {
            result.push(fields[j]);
          } 
        }
      } 
      
      return result;
    }
    
    static validateFieldVisibilityRule(reply, rule) {
      let isVisible = false;
      let analyzed = false;

      if (rule.field) {
        const valueSet = reply[rule.field] !== undefined && reply[rule.field] !== null && reply[rule.field] !== '';
        const fieldValue = valueSet ? reply[rule.field] : null;

        analyzed = true;
        
        if (rule.equals === true) {
          isVisible = valueSet;
        } else if (rule.equals) {
          isVisible = rule.equals === fieldValue;
        } else if (rule['not-equals'] === true) {
          isVisible = !valueSet;
        } else if (rule['not-equals']) {
          isVisible = rule['not-equals'] !== fieldValue;
        }
      }

      if (Array.isArray(rule.and)) {
        let andResult = true;
        for (let i = 0; i < rule.and.length; i++) {
          const andSubRule = rule.and[i];
          andResult = andResult && Form.validateFieldVisibilityRule(reply, andSubRule);
          if (!andResult) {
            break;
          }
        }
        isVisible = analyzed ? isVisible && andResult : andResult;
      }

      if (Array.isArray(rule.or)) {
        let orResult = false;
        for (let j = 0; j < rule.or.length; j++) {
          const orSubRule = rule.or[j];
          orResult = orResult || Form.validateFieldVisibilityRule(reply, orSubRule);
          if (orResult) {
            break;
          }
        }
        isVisible = analyzed ? isVisible || orResult : orResult;
      }
      
      return isVisible;
    }
    
    static validateFieldVisibilityRules(reply, field) {
      if (!field.visibilityRules) {
        return true;
      }
      
      for (let i = 0; i < field.visibilityRules.length; i++) {
        const rule = field.visibilityRules[i];
        if (!Form.validateFieldVisibilityRule(reply, rule)) {
          return false;
        }
      }
      
      return true;
    }
    
    static validateRequest(req) {
      const fields = Form.fields();
      
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];

        const fieldVisible = Form.validateFieldVisibilityRules(req.body, field);

        if (field.required && fieldVisible) {
          req.checkBody(field.name, util.format("Syötä %s", field.title)).notEmpty();
        } else if (!fieldVisible) {
          delete req.body[field.name];
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
              let options = Form.resolveFieldOptions(field);
              req.checkBody(field.name, util.format("%s ei ole joukossa %s", field.title, options.join(','))).isIn(options);
            break;
            case 'date':
              if (field.constraints) {
                const constraints = field.constraints;
                if (constraints['min-date']) {
                  const minDate = Form.resolveMinDate(constraints['min-date']);
                  req.checkBody(field.name, util.format("%s on ennen %s", field.title, minDate.toDate())).custom((value) => {
                    return moment(value).utc(true).isSameOrAfter(minDate);
                  });
                }
                if (constraints['disabled-weekday-indices']) {
                  const disabledIndices = constraints['disabled-weekday-indices'];
                  req.checkBody(field.name, util.format("%s on joukossa %s", field.title, disabledIndices.join(','))).custom((value) => { 
                    return disabledIndices.indexOf(new Date(value).getDay()) === -1; 
                  });
                }
              }
            break;
            default:
            break;
          }
        } 
      }
    }

    static resolveMinDate(minDateString) {
      if (minDateString.startsWith('+') || minDateString.startsWith('-')) {
        const dateStringParts = minDateString.split('_');
        const operator = dateStringParts[0];
        const amount = parseInt(dateStringParts[1]);
        const unit = dateStringParts[2];
        
        return operator === '+' ? moment().utc().add(amount, unit).startOf('day') : moment().utc().subtract(amount, unit).startOf('day');
      } else {
        return moment(minDateString).utc();
      }
    }

    static sanitizedBody(req) {
      let data = {};
      const fields = Form.fields();
      
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
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
      const value = req.body[name];
      return value !== undefined && value !== null && value !== '';
    }
    
    static replyModel() {
      if (Form._replyModel) {
        return Form._replyModel;
      }
      
      const fields = Form.fields();
      
      const schemaOptions = {};
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const fieldType = field.type;
        const skip = NOT_SAVED_FIELDS.indexOf(fieldType) > -1;
        
        if (!skip) {
          const schemaType = Form.resolveSchemaType(field);
          const schemaField = {
            type: schemaType
          };
    
          if (field.type === 'radio' || field.type === 'select') {
            schemaField.enum = [null].concat(Form.resolveFieldOptions(field));
            schemaField.default = Form.resolveFieldDefaultOption(field);
          }          
  
          schemaOptions[field.name] = schemaField;
        }
      }

      schemaOptions.created = Date;
      schemaOptions.modified = Date;
      schemaOptions.lastEditor = String;
      
      const schema = new mongoose.Schema(schemaOptions);
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
      };
    }
    
    static createReply(data, callback) {
      const FormReplyModel = Form.replyModel();      
      const reply = new FormReplyModel(_.extend(data, {
        created: new Date(),
        modified: new Date()
      }));
      
      reply.save(callback); 
    }
    
    static deleteReply(id, callback) {
      Form.replyModel().findByIdAndRemove(id, (err) => {
        if (err) {
          callback(err);
        } else {
          callback(null);
        }
      });
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
          const fields = Form.fields();
          let fileLoads = [];
          
          for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            if (field.type == 'files') {
              let fileIds = (formReply[field.name] || []);
              fileLoads = fileLoads.concat(fileIds.map((fileId) => {
                return this.createFileMetaLoad(field.name, fileId);
              }));
            }
          }
          
          async.parallel(fileLoads, (fileErr, fileMetaResponses) => {
            if (fileErr) {
              callback(fileErr);
            } else {
              const result = formReply;
              const fieldMetas = {};
              
              for (let i = 0; i < fileMetaResponses.length; i++) {
                let fileMetaResponse = fileMetaResponses[i];
                let fileMeta = fileMetaResponse.fileMeta;
                let fileMetas = fieldMetas[fileMetaResponse.fieldName] || [];
                fieldMetas[fileMetaResponse.fieldName] = fileMetas.concat([fileMeta]);
              }
              
              for (let j = 0; j < fields.length; j++) {
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
    
    static listReplies(token, includeFiltered, callback) {
      const query = {};
      if (token) {
        const targetingFields = Form.listTargetingFields();
        const targetingFieldsQuery = [];
        const booleanTargetValues = [];
        for (let i = 0; i < targetingFields.length; i++) {
          const targetingField = targetingFields[i];
          const targetOptionValues = [];
          if (targetingField.type === 'boolean') {
            if (token.hasRole(targetingField.name)) {
              booleanTargetValues.push({ [targetingField.name]: true});
            }
          } else {
            targetOptionValues.push({ [targetingField.name]: null });
            
            for (let j = 0; j < targetingField.options.length; j++) {
              const option = targetingField.options[j];
              if (token.hasRole(option.name)) {
                targetOptionValues.push({ [targetingField.name]: option.name});
              }
            }
          }

          if (targetOptionValues.length > 0) {
            targetingFieldsQuery.push({
              '$or': targetOptionValues
            });
          }
        }

        if (booleanTargetValues.length > 0) {
          targetingFieldsQuery.push({
            '$or': booleanTargetValues
          });
        }

        if (targetingFieldsQuery && targetingFieldsQuery.length) {
          query['$and'] = targetingFieldsQuery;
        }
      }

      if (!includeFiltered) {
        const filterFields = Form.listFilterFields();
        if (filterFields && filterFields.length) {
          for (let i = 0; i < filterFields.length; i++) {
            const filterField = filterFields[i];
            if (filterField.type == 'radio') {
              let excludeValues = 
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
          const tableDef = {};
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
      for (let i = 0; i < field.options.length; i++) {
        if (field.options[i].checked) {
          return field.options[i].name;
        }
      }
      
      return null;
    }
    
  }
  
  module.exports = Form;
  
}).call(this);