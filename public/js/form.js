(function(){
	'use strict';
	

  $.widget("custom.metaform", {
    
    _create : function() {
      this.element.on("submit", $.proxy(this._onFormSubmit, this));
    },
    
    _onFormSubmit: function (event) {
      event.preventDefault();
      var data = this.element.serialize();
      
      $.ajax({
        url: '/formReply',
        data: data,
        method: 'POST',
        success: function() {
          $('<div>')
            .addClass('alert alert-success fixed-top')
            .text('Lomake lähetettiin onnistuneesti')
            .appendTo(document.body);        
        },
        error: function (jqXHR, textStatus) {
          $('<div>')
            .addClass('alert alert-danger fixed-top')
            .text('Lomakkeen lähetys epäonnistui: ' + textStatus)
            .appendTo(document.body);        
        }
      });
    }
  
  });
  
  $.widget("custom.tableField", {
    
    _create : function() {
      this.element.on('click', '.add-table-row', $.proxy(this._onAddtableRowClick, this));
      this.element.on('change', 'input', $.proxy(this._onInputChange, this));
      this._refresh();

      if (this.element.find('th[data-calculate-sum="true"]').length) {
        this.element.find('tfoot').show();
      } else {
        this.element.find('tfoot').hide();
      }
    },
    
    _addRow: function () {
      var clonedRow = this.element.find('tbody tr:first-child').clone();
      clonedRow.appendTo(this.element.find('tbody'));
      clonedRow.find('input').each($.proxy(function (index, input) {
        $(input).val('');
      }, this));
    },
    
    _refresh: function () {
      var datas = [];
      
      this.element.find('thead th[data-calculate-sum="true"]').each($.proxy(function (rowIndex, row) {
        var sum = 0;
        var columnIndex = $(row).index();
        
        this.element.find('tbody td:nth-of-type(' + (columnIndex + 1) + ' )').each(function (index, column) {
          var value = $(column).find('input').val();
          if (value) {
            sum += parseFloat(value);
          }
        });
        
        
        this.element.find('tfoot td:nth-of-type(' + (columnIndex + 1) + ' ) .sum').text(sum);
      }, this));
      
      this.element.find('tbody tr').each(function () {
        var rowDatas = {};
        
        $(this).find('input').each(function () {
          rowDatas[$(this).attr('data-column-name')] = $(this).val();
        });
        
        datas.push(rowDatas);
      });
      
      this.element.find('input[name="' + this.element.attr('data-field-name') + '"]').val(JSON.stringify(datas));
    },
    
    _onAddtableRowClick: function (event) {
      event.preventDefault();
      this._addRow();
    },
    
    _onInputChange: function (event) {
      event.preventDefault();
      this._refresh();
    }
    
  });
	
  $.widget("custom.fileField", {
    
    _create : function() {
      this.element.find('.add-file-button').on("click", $.proxy(this._onAddFileButtonClick, this));
      this.element.on('click', '.remove-file-button', $.proxy(this._onRemoveFileButtonClick, this));
      
      this.element.find('.progress-bar').hide();
      this.element.find('input[type="file"]')
        .css({
          opacity: 0
        })
        .fileupload({
          dataType: 'json',
          url: '/upload',
          add : $.proxy(this._onUploadAdd, this),
          fail: $.proxy(this._onUploadFail, this),
          done : $.proxy(this._onUploadDone, this),
          progressall : $.proxy(this._onProgressAll, this) 
        });
    },
    
    _onAddFileButtonClick: function (event) {
       event.preventDefault();
       
       this.element.find('.progress-bar')
         .show()
         .removeClass('bg-success')
         .addClass('progress-bar-animated progress-bar-striped')
         .css({
           'width': '0%'  
         });

       this.element.find('input[type="file"]')[0].click();
    },

    _onUploadAdd: function (event, data) {
      this.element.find('.add-file-button')
        .attr('disabled', 'disabled')
        .prop('disabled', true)
        .addClass('disabled');
      
      data.submit();
    },
    
    _onUploadFail: function (event, data) {
      
    },
    
    _onUploadDone: function (event, data) {
      this.element.find('.add-file-button')
        .removeAttr('disabled')
        .prop('disabled', false)
        .removeClass('disabled');

      this.element.find('.progress-bar')
        .removeClass('progress-bar-animated progress-bar-striped')
        .addClass('bg-success')
        .css({
          'width': '100%'  
        });
      
      $.each(data.result, $.proxy(function (index, file) {
        var row = $('<div>')
          .addClass('file row')
          .appendTo(this.element.find('.files'));
        
        var cell = $('<div>')
          .addClass('col-12')
          .appendTo(row);
        
        $('<input>')
          .attr({
            'type': 'hidden',
            'name': this.element.attr('data-field-name'),
            'value': file._id
          })
          .appendTo(cell);
        
        $('<a>')
          .attr({
            'href': '/upload/' + file.fileData,
            'target': 'blank'
          })
          .text(file.originalname)
          .appendTo(cell);
       
        $('<button>')
          .addClass('remove-file-button btn btn-danger btn-sm float-right')
          .attr('data-id', file._id)
          .text('Poista')
          .appendTo(cell);
          
      }, this));
    },
    
    _onProgressAll: function (event, data) {
      var progress = parseInt(data.loaded / data.total * 100, 10);
      this.element.find('.progress-bar')
        .css({
          'width': progress + '%'  
        });
    },
    
    _onRemoveFileButtonClick: function (event) {
      event.preventDefault();
      var button = $(event.target).closest('.remove-file-button');
      var fileId = button.attr('data-id');
      
      $.ajax({
        url: '/upload/' + fileId,
        method: 'DELETE',
        success: $.proxy(function(res) {
          $(button).closest('.file').remove();
        }, this)
      });
      
    }
  
  });
  
  
	
  $(document).ready(function () {
    $('form').metaform();
    $('.file-component').fileField();
    $('.table-field').tableField();
  });
  
}).call(this);