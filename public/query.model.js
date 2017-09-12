console.log('123:', 123);
$.post('/api/hello?token=' + token, {token, token}, function success(rows) {
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var classSeverity = row.severity === 'I' ? 'col-severityI' : 'col-severityF';
    $('#logs tbody').append('<tr><td class="col-100px text-overflow text-center '+classSeverity+'">'+row.severity+'</td><td class="col-100px text-overflow text-center">'+row.hostname+'</td><td class="col-max text-overflow" title="'+row.message+'"><span class="toto">'+row.message+'</span></td></tr>');
  }
});

$(document).ajaxError(function(err) {
  alert('Error with ajax');
  console.error(err);
});
