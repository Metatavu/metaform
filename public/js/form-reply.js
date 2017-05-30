(function(){
  'use strict';

  $.widget("custom.metaform", {
    
    _create : function() {
      this.element.on("submit", $.proxy(this._onFormSubmit, this));
      this.socket = io();
      $(window).on('unload', $.proxy(this._onWindowUnload, this));
      this._sendReplyOpened();
      this.replyOpenTimer = setInterval($.proxy(this._sendReplyOpened, this), 20000);
      this.element.find('.table-field').each(function (tableIndex, table) {
        $(table).find('thead th[data-calculate-sum="true"]').each(function (rowIndex, row) {
          var sum = 0;
          var columnIndex = $(row).index();
          
          $(table).find('tbody td:nth-of-type(' + (columnIndex + 1) + ' )').each(function (index, column) {
            var value = $(column).text();
            if (value) {
              sum += parseFloat(value);
            }
          });
                  
          $(table).find('tfoot td:nth-of-type(' + (columnIndex + 1) + ' ) .sum').text(sum);
        });
      });
      
      this.element.find('input[data-type="date"][readonly]').each(function (index, input) {
        var isoDate = $(input).attr('data-iso-date');
        $(input).val(moment(isoDate).format('DD.MM.YYYY'));
      });
    },
    
    _sendReplyOpened: function() {
      this.socket.emit('reply:opened', {
        'replyId': this.element.attr('data-id')
      });
    },
    
    _onWindowUnload: function() {
      clearInterval(this.replyOpenTimer);
      this.socket.emit('reply:closed', {
        'replyId': this.element.attr('data-id')
      });
    },
    
    _onFormSubmit: function (event) {
      event.preventDefault();
      var data = this.element.serialize();
      
      $.ajax({
        url: '/formReply/' + this.element.attr('data-id'),
        data: data,
        method: 'PUT',
        success: function() {
          $('<div>')
            .addClass('alert alert-success fixed-top')
            .text('Lomake tallennettiin onnistuneesti')
            .appendTo(document.body);        
          
          window.location.href = "/admin";
        },
        error: function (jqXHR, textStatus) {
          var errorMessage = textStatus ? jqXHR.responseText || jqXHR.statusText || textStatus : null;
          $('<div>')
            .addClass('alert alert-danger fixed-top')
            .text('Lomakkeen lähetys epäonnistui: ' + errorMessage)
            .appendTo(document.body);        
        }
      });
    }
  
  });
  
  $(document).ready(function () {
    $('form').metaform();
  });
  
}).call(this);