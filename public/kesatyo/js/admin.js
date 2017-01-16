(function(){
	'use strict';
	
  $('.applicant-birthday').each(function(){
    var birthday = moment($(this).text());
    $(this).text(birthday.format('D.M.YYYY'));
  })
  
  $('.filter').change(function(){
    var queryString = '';
    $('.filter').each(function(){
      queryString += $(this).attr('name')+'='+$(this).val()+'&';
    });
    window.location.href = SERVER_ROOT+'/admin?'+queryString.slice(0, -1);
  });
  
  $('#excelImport').click(function(){
    var queryString = '';
    $('.filter').each(function(){
      queryString += $(this).attr('name')+'='+$(this).val()+'&';
    });
    window.location.href = SERVER_ROOT+'/export?'+queryString.slice(0, -1);
    /*var table = $('#applicationTable').DataTable();
    var data = table
      .rows()
      .data();
    var csvContent = "data:text/csv;charset=utf-8,";
    for(var i = 0; i < data.length;i++){
      csvContent += i - 1 < data.length ? data[i].join(';')+ "\n" : data[i].join(',');
    }
    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);*/
  });
  
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