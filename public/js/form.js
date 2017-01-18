(function(){
	'use strict';
	
  $.widget("custom.fileField", {
    
    _create : function() {
      this.element.find('.add-file-button').on("click", $.proxy(this._onAddFileButtonClick, this));
      this.element.on('click', '.remove-file-button', $.proxy(this._onRemoveFileButtonClick, this));
      
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
            'name': 'files',
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
    $('.file-component').fileField();
  });
  
}).call(this);