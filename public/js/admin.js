/* global vex */

(function(){
  'use strict';

  vex.defaultOptions.className = 'vex-theme-default';

  $('#formsTable').DataTable();
  
  var socket = io();
  
  socket.on('reply:locked', function(replyId) {
    $('tr[data-reply-id="' + replyId +'"]').addClass('locked');
  });
  
  socket.on('reply:unlocked', function(replyId) {
    $('tr[data-reply-id="' + replyId +'"]').removeClass('locked');
  });
  
  $(document).on('click', '.delete-reply-btn', function(e) {
    var id = $(e.target).closest('.delete-reply-btn').attr('data-id');
    vex.dialog.confirm({
      message: 'Haluatko varmasti poistaa vastauksen pysyvästi?',
      callback: function (value) {
        if (value) {
          $.ajax({
            url: '/admin/replies/' + id,
            type: 'DELETE',
            success: function(response) {
              $(e.target).parents('tr').remove();
            }
          });
        }
      }
    });
  });
  
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