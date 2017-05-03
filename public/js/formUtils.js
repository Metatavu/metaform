(function(){
  
  'use strict';
  
  window.MetaformUtils = {
    createDatePicker: function(input) {
      $(input).flatpickr({
        "locale": "fi",
        "altFormat": "d.m.Y",
        "altInput": true,
        "utc": true,
        "allowInput": false
      });
    }, 
    createTimePicker: function(input) {
      $(input).flatpickr({
        "locale": "fi",
        "allowInput": false,
        "noCalendar": true,
        "enableTime" : true,
        "time_24hr": true
      });
    }
  };
  
})();


