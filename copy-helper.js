var copy = require('copy');
copy('raw/*.js', 'public', function(err, files) {
  if(err){
    console.log(err);
  }
});