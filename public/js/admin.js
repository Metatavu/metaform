/* global vex */

(function(){
  'use strict';

  vex.defaultOptions.className = 'vex-theme-default';

  $('#formsTable').DataTable();	
  
  $('.xlsx-export').click(function(e) {
    e.preventDefault();
    
    var includeFiltered = typeof($(this).attr('data-include-filtered')) !== 'undefined' && $(this).attr('data-include-filtered') !== false;

    $.getJSON('/admin/fields', function(fields) {
      vex.dialog.open({
        message: 'Valitse vietävät kentät',
        input: renderXlsxExportModal({
          fields: fields
        }),
        callback: function (data) {
          if (data) {
            var fields = encodeURIComponent(Object.keys(data).join(','));
            var url = '/admin/export/xlsx?fields='+fields;
            if (includeFiltered) {
              url += '&includeFiltered=true';
            }
            window.open(url);
          }
        }
      });
    });
  });
  
})();