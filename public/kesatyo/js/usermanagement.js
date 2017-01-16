(function(){
  'use strict';
  
  var userData = {};
  var selectedUser = null;
  
  $.getJSON(SERVER_ROOT+'/user/list', function(users){
    for(var i = 0, j = users.length;i < j;i++){
      var user = users[i];
      userData[user._id] = user;
      $('#all-users-table').append('<tr data-id="'+user._id+'"><td>'+user.email+'</td><td>'+user.role+'</td></tr>');
    }
  });
  
  $(document).on('click', '#all-users-table > tr', function(e){
    selectedUser = $(this).data('id');
    $('#all-users-table > tr').removeClass('user-selected');
    $(this).addClass('user-selected');
  });
  
  $('#add-user-button').click(function(){
    $('#add-new-user-modal').modal('show');
  });
  
  $('#delete-user-button').click(function(){
    $.post(SERVER_ROOT+'/user/archieve',{id: selectedUser}, function(user){
      $('.user-selected').remove();
      selectedUser = null;
    });
  });
  
})();