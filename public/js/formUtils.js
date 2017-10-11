/* global moment */

(function(){
  
  'use strict';
  
  window.MetaformUtils = {
    createDatePicker: function(input) {
      const datePickerOptions = {
        "locale": "fi",
        "altFormat": "d.m.Y",
        "altInput": true,
        "allowInput": true
      };

      if ($(input).attr("data-constraints")) {
        var constraints = JSON.parse($(input).attr("data-constraints"));

        if (constraints['min-date']) {
          var minDateString = constraints['min-date'];
          if (minDateString.startsWith('+') || minDateString.startsWith('-')) {
            var minDateParts = minDateString.split('_');
            var operator = minDateParts[0];
            var amount = parseInt(minDateParts[1], 10);
            var unit = minDateParts[2];
            var minDate = moment();
            if (operator === '+') {
              minDate.add(amount, unit);
            } else {
              minDate.subtract(amount, unit);
            }
            datePickerOptions.minDate = minDate.toDate();
          } else {
            datePickerOptions.minDate = moment(minDateString).toDate();
          }
        }
        
        if (constraints['disabled-weekday-indices']) {
          var disable = [];
          disable.push(MetaformUtils._createDisabledIndicesFunction(constraints['disabled-weekday-indices']));
          datePickerOptions.disable = disable;
        }
      }
      
      $(input).flatpickr(datePickerOptions);
    },
    
    _createDisabledIndicesFunction(disabledIndices) {
      return function(date) {
        return disabledIndices.indexOf(date.getDay()) !== -1;
      };
    },
    
    createTimePicker: function(input) {
      $(input).flatpickr({
        "locale": "fi",
        "allowInput": true,
        "noCalendar": true,
        "enableTime" : true,
        "time_24hr": true
      });
    }
  };
  
})();


