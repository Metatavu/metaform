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
          
          setTimeout(function () {
            window.location.reload(true);
          }, 2000);
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
  
  $.widget("custom.tableField", {
    
    _create : function() {
      this.element.on('click', '.add-table-row', $.proxy(this._onAddtableRowClick, this));
      this.element.on('click', '.print-table', $.proxy(this._onPrintTableClick, this));
      this.element.on('change', 'input', $.proxy(this._onInputChange, this));
      this.element.on('change', 'td[data-column-type="enum"] select', $.proxy(this._onEnumSelectChange, this));

      this._refresh();

      if (this.element.find('th[data-calculate-sum="true"]').length) {
        this.element.find('tfoot').show();
      } else {
        this.element.find('tfoot').hide();
      }
      
      this.element.find('[data-column-type="enum"] select').each($.proxy(function (index, select) {
        this._refreshEnumSelect($(select));
      }, this));
    },
    
    _addRow: function () {
      var clonedRow = this.element.find('tbody tr:first-child').clone();
      clonedRow.appendTo(this.element.find('tbody'));
      clonedRow.find('input').each($.proxy(function (index, input) {
        $(input).val('');
      }, this));

      clonedRow.find('[data-column-type="enum"] select').each($.proxy(function (index, select) {
        this._refreshEnumSelect($(select));
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

      this.element.find('tbody tr').each($.proxy(function (indexRow, row) {
        var rowDatas = {};
        
        $(row).find('td').each($.proxy(function (index, cell) {
          var value = this._getCellValue(cell);
          var columnName = $(cell).attr('data-column-name');
          rowDatas[columnName] = value;
        }, this));
        
        datas.push(rowDatas);
      }, this));
      
      this.element.find('input[name="' + this.element.attr('data-field-name') + '"]').val(JSON.stringify(datas));
    },
    
    _refreshEnumSelect: function (enumSelect) {
      var other = !!$(enumSelect).find('option:checked').attr('data-other');
      if (other) {
        $('<input>')
          .addClass('enum-other form-control')
          .css({'width': '50%', 'display': 'inline'})
          .insertAfter(enumSelect);
          enumSelect.css({'width': 'calc(50% - 4px)', 'display': 'inline', 'margin-right': '4px'});
      } else {
        enumSelect.parent().find('.enum-other').remove();
        enumSelect.css({'width': '100%', 'display': 'block'})
      }
    },
    
    _onAddtableRowClick: function (event) {
      event.preventDefault();
      this._addRow();
    },
    
    _onInputChange: function (event) {
      event.preventDefault();
      this._refresh();
    },
    
    _onEnumSelectChange: function (event) {
      this._refreshEnumSelect($(event.target));
      this._refresh();
    },
    
    _getCellValue: function (cell) {
      var columnType = $(cell).attr('data-column-type');
      
      switch (columnType) {
        case 'enum':
          var option = $(cell).find('option:checked');
          if (option.attr('data-other')) {
            return option.text() + ' ' + $(cell).find('input.enum-other').val();
          } else {
            return option.text();
          }
        break;
        default:
          return $(cell).find('input').val();
        break;
      }
      
      return null;
    },
    
    _generatePrintableTable: function () {
      var tableHeaders = $.map(this.element.find('thead tr th'), function (th) {
        return {
          text: $(th).text(),
          style: 'tableHeader'
        };
      });
      
      var tableWidths = ['*'];
      for (var i = 1; i < tableHeaders.length; i++) {
        tableWidths.push('auto');  
      }
      
      var tableBody = [ tableHeaders ];
      
      this.element.find('tbody tr').each($.proxy(function (rowIndex, tr) {
        var row = [];
        
        $(tr).find('td').each($.proxy(function (cellIndex, cell) {
          var value = this._getCellValue(cell);
          row.push({
            text: value||'' 
          });
        }, this));
        
        tableBody.push(row);
      }, this));
      
      this.element.find('tfoot tr').each(function (rowIndex, tr) {
        var row = [];
        
        $(tr).find('td').each(function (cellIndex, cell) {
          var value = $(cell).text();
          row.push({
            text: value||'',
            style: 'tableFooter'
          });
        });
        
        tableBody.push(row);
      });
      
      return {
        content: [{ 
          text: this.element.attr('data-field-title')||'', 
          style: 'header' 
        }, {
          table: {
            body: tableBody,
            widths: tableWidths
          }
        }],
        styles: { 
          header: {
            fontSize: 18,
            bold: true,
            marginBottom: 10
          },
          tableHeader: {
            bold: true
          },
          tableFooter: {
            bold: true
          }
        }
      };
    },
    
    _onPrintTableClick: function (event) {
      event.preventDefault();
      
      var docDefinition = this._generatePrintableTable();
      
      pdfMake.createPdf(docDefinition)
        .download(this.element.attr('data-field-name') + '.pdf');
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