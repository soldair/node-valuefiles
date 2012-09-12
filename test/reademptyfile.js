var test = require('tap').test
,valuefiles =  require(__dirname+'/../index.js')
;


test('read empty file',function(t){
  var api = valuefiles();
  api.get('oh no!',function(err,data){
    t.ok(!err,'should not have error reading empty file');
    t.equals(data,undefined,'data should be undefined');
    api.rm('oh no!',function(){
      t.ok(true,'rm callback should have been called');
      t.end();
    });
  })
});
