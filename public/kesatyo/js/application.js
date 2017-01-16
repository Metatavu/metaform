(function(){
	'use strict';
	
  var fieldSaveTimer;
  
  $('input[data-type="date"]').datepicker({
		language: 'fi',
		format: 'd.m.yyyy',
		weekStart: 1
	});
  
	var sexCode = $('#applicant-sex').text() == 'male' ? 'Mies' : 'Nainen';
	$('#applicant-sex').text(sexCode);
	
	var birthday = moment($('#applicant-birthday').text());
	$('#applicant-birthday').text(birthday.format('D.M.YYYY'));
	
  var startDate = moment($('#startDateInput').val()).format('D.M.YYYY');
  if(startDate !== 'Invalid date'){
    $('#startDateInput').val(startDate);
  }

  var endDate = moment($('#endDateInput').val()).format('D.M.YYYY');
  if(endDate !== 'Invalid date'){
	 $('#endDateInput').val(endDate);
  }
  
	var added = moment($('#application-added').data('data-added'));
	$('#application-added').text(added.format('D.M.YYYY'));
  
  function updateApplication(){
    var data = getValues();
		var id = $('#applicationId').val();
		$('#loader-img').show();
		$.post(SERVER_ROOT+'/update', {id: id, data: data}, function(res){
			noty({
			    text: 'Hakemuksen tila päivitetty onnistuneesti.',
				type: 'success',
				timeout: 3000,
			    animation: {
			        open: 'animated fadeIn',
			        close: 'animated fadeOut',
			    }
			});
			$('#loader-img').hide();
		}).fail(function(err){
			noty({
			    text: 'Tilan päivitys epäonnistui, yritä myöhemmin uudelleen.',
				type: 'error',
			    timeout: 3000,
				animation: {
			        open: 'animated fadeIn',
			        close: 'animated fadeOut',
			    }
			});
			$('#loader-img').hide();
		});
  }
  
  function getValues(){
    var application = {};
    $('.staff-fields textarea').each(function(){
        application[$(this).attr('name')] = $(this).val();
    });
    $('.staff-fields select').each(function(){
        application[$(this).attr('name')] = $(this).val();
    });
    $('.staff-fields input[type="text"]').each(function(){
      if($(this).attr('data-type') !== 'date'){
        application[$(this).attr('name')] = $(this).val();
      }  
    });
    $('.staff-fields input[data-type="date"]').each(function(){
      if($(this).val() !== ''){
        application[$(this).attr('name')] = moment($(this).val(), 'D.M.YYYY').toDate();
      }
    });

    application.state = $('input[name="state"]:checked').length > 0 ? $('input[name="state"]:checked').val() : '';
    
    return application;
  }
	
  $('.staff-fields input[type="text"]').keyup(function(){
    clearTimeout(fieldSaveTimer);
    fieldSaveTimer = setTimeout(function(){
      updateApplication();
    }, 1500);
  });
  
  $('.staff-fields textarea').keyup(function(){
    clearTimeout(fieldSaveTimer);
    fieldSaveTimer = setTimeout(function(){
      updateApplication();
    }, 1500);
  });
  
  $('.staff-fields select').change(function(){
    updateApplication();
  });
  
	$('input[name="state"]').change(function(){
    updateApplication();
	});
	
  $('.staff-fields input[data-type="date"]').change(function(){
    updateApplication();
  });
  
})();