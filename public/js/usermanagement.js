(function(){
  'use strict';
  
  var userData = {};
  var selectedUser = null;
  
  $.getJSON('/user/list', function(users){
    for(var i = 0, j = users.length;i < j;i++){
      var user = users[i];
      userData[user._id] = user;
      var newRow = $('tr').attr('data-id', user._id);
      newRow.append($('td').text(user.email));
      newRow.append($('td').text(user.role));
      $('#all-users-table').append(newRow);
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
    $.post('/user/archieve',{id: selectedUser}, function(user){
      $('.user-selected').remove();
      selectedUser = null;
    });
  });
  
})();