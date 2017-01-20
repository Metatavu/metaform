(function(){
	'use strict';
  
	$('#formsTable').DataTable();
	
	$(document).on('click', '#formsTable tr', function(e){
		var id = $(this).attr('data-application-id').replace(/"/g, '');
     window.open(SERVER_ROOT+'/application/'+id);
	});
	
})();