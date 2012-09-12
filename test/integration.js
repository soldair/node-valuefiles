var test = require('tap').test;
var valuefiles = require(__dirname+'/../index.js');

test('test get set key',function(t){
  var api = valuefiles(__dirname+'/tmp');
  var v = Date.now();
  api.set('a',v,function(err,data){

    console.log(err,data);

    t.ok(!err,'should not have error');
    t.ok(data,'return value from set should be ok');

    api.get('a',function(err,data){
      console.log('got! ',err,data);
      t.ok(!err,'should not have error');
      t.equals(data,v,'return value from get should be what i set');     
      t.end();
    });
  });
});
