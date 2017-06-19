(function(){
  
  'use strict';
  
  window.MetaformUtils = {
    createDatePicker: function(input) {
      $(input).flatpickr({
        "locale": "fi",
        "altFormat": "d.m.Y",
        "altInput": true,
        "utc": true,
        "allowInput": true
      });
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


