(function(){
	'use strict';
	
  $.widget("custom.fileField", {
    
    _create : function() {
      this.element.find('.add-file-button').on("click", $.proxy(this._onAddFileButtonClick, this));
      
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
        $('<p/>')
          .append('<input type="hidden" value="' + file._id + '" name="files" />')
          .append('<a href="/upload/' + file.fileData + '" target="blank">' + file.originalname + '</a>')
          .append($('<button>').addClass('remove-file-button btn btn-danger btn-sm').attr('data-id', file._id).text('Poista'))
          .appendTo(this.element.find('.files'));
      }, this));
    },
    
    _onProgressAll: function (event, data) {
      var progress = parseInt(data.loaded / data.total * 100, 10);
      this.element.find('.progress-bar')
        .css({
          'width': progress + '%'  
        });
    }
  
  });
	
  $(document).ready(function () {
    $('.file-component').fileField();
  });
  
}).call(this);