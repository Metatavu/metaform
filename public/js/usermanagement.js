(function(){
  'use strict';
  
  var userData = {};
  var selectedUser;
  
  function markRowArchived(row) {
    row
      .addClass('archived')
      .attr('title', 'Käyttäjä on poistettu');

    row.find('.delete-user-button')
      .attr('disabled', 'disabled');
  }
  
  function loadUsers() {
    $.getJSON('/user/list', function(users){
      for(var i = 0, j = users.length;i < j;i++){
        var user = users[i];
        userData[user._id] = user;
        
        var newRow = $('<tr>').attr('data-id', user._id);
        var removeButton = $('<button>').addClass('btn btn-sm btn-danger delete-user-button').text('Poista');
        if (user.role == 'admin') {
          removeButton.attr('disabled', 'disabled');
        }
        
        newRow.append($('<td>').addClass('email').text(user.email));
        newRow.append($('<td>').text(user.role));
        newRow.append($('<td>').css('width', '0').append(removeButton));
        
        $('#all-users-table').append(newRow);

        if (user.archived) {
          markRowArchived(newRow);
        }
      }
    });
  }
  
  function reloadUsers() {
    $('#all-users-table').empty();
    loadUsers();
  }
  
  $(document).on('click', '#add-user-button', function(){
    $('#add-new-user-modal').modal('show');
  });
  
  $(document).on('click', '#remove-user-modal .btn-success', function(event) {
    event.preventDefault();
    var button = $(event.target);
    var id = button.attr('data-user-id');
    
    $.ajax({
      url: '/user/' + id,
      method: 'DELETE',
      success: function() {
        $('<div>')
          .addClass('alert alert-success')
          .text('Käyttäjä poistettiin onnistuneesti')
          .insertBefore($('table'));        
        reloadUsers();
      },
      error: function (jqXHR, textStatus) {
        $('<div>')
          .addClass('alert alert-danger')
          .text('Käyttäjän poisto epäonnistui: ' + textStatus)
          .insertBefore($('table'));        
      }
    });
    
  });
  
  $(document).on('click', '.delete-user-button', function(event) {
    var button = $(event.target);
    var row = button.closest('tr');
    var id = row.attr('data-id');
    var email = row.find('.email').text();
    
    $('#remove-user-modal')
      .find('.question')
      .text('Oletko varma, että haluat poistaa käyttäjän ' + email + '?');

    $('#remove-user-modal .btn-success').attr('data-user-id', id);
    $('#remove-user-modal').modal('show');
  });
  
  $(document).ready(function () {
    loadUsers();
  });
  
})();