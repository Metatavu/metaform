(function(){
  'use strict';
  $(document).ready(function(){
    $('#send-password-reset-req').click(function(e){
      e.preventDefault();
      var email = $('#user-email-input-field').val();
      if(typeof(email) !== 'undefined' && email !== ''){ //TODO: add better validation
        $('.alert-container').empty();
        $.post(SERVER_ROOT+'/forgotpassword', {email : email}, function(res){
          $('.alert-container').append('<div class="alert alert-success" role="alert"><strong>Onnistui!</strong> Ohjeet salasanan palauttamiseen on lähetty antamaasi sähköpostiin.</div>');
        }).fail(function(res){
          $('.alert-container').append('<div class="alert alert-danger" role="alert"><strong>Virhe!</strong> '+res.responseText+'</div>');
        });
      }
    });
  });
}).call(this);