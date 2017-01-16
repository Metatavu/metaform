var mongoose = require('mongoose');
var _ = require('underscore');

class Form {
  
  static config() {
    
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
    } 
    
    return null;
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
        schemaField.enum = _.map(field.options, (option) => {
          return option.name;
        });
      }

      schema[field.name] = schemaField;
    }
    
    return new mongoose.Schema(schema);
  }
  
}

module.export = Form;