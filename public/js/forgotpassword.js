(function(){
  'use strict';
  
  $(document).on('click', '#reset-password', function (event) {
    event.preventDefault();
    $('.alert-container').empty();
    
    var email = $('input[name="email"]').val();
    if (email) {
      $.post('/forgotpassword', { email : email }, function(res){
        $('<div>')
          .addClass('alert alert-success')
          .attr('role', 'alert')
          .html('<strong>Onnistui!</strong> Ohjeet salasanan palauttamiseen on lähetty antamaasi sähköpostiin.</div>')
          .appendTo($('.alert-container'));
      }).fail(function(res) {
        $('<div>')
          .addClass('alert alert-danger')
          .attr('role', 'alert')
          .html('<strong>Virhe!</strong>&nbsp;' + res.responseText + '</div>')
          .appendTo($('.alert-container'));
      });
    }
  });
  
}).call(this);