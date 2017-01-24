(function(){
	'use strict';
  
  $(document).ready(function () {
    $('.table-field').each(function (tableIndex, table) {
      $(table).find('thead th[data-calculate-sum="true"]').each(function (rowIndex, row) {
        var sum = 0;
        var columnIndex = $(row).index();
        
        $(table).find('tbody td:nth-of-type(' + (columnIndex + 1) + ' )').each(function (index, column) {
          var value = $(column).text();
          if (value) {
            sum += parseFloat(value);
          }
        });
                
        $(table).find('tfoot td:nth-of-type(' + (columnIndex + 1) + ' ) .sum').text(sum);
      });
    });
  });
  
}).call(this);