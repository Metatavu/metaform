(function(){
	'use strict';
  
	$('#menu-toggle').click(function(e) {
      e.preventDefault();
      $('#wrapper').toggleClass('toggled');
    });
	
	$('#applicationTable').DataTable();
	
	$(document).on('click', '#applicationTable tr', function(e){
		var id = $(this).attr('data-application-id').replace(/"/g, '');
     window.open(SERVER_ROOT+'/application/'+id);
	});
	
})();