var test = require('tap').test
,valuefiles =  require(__dirname+'/../index.js')
;


test('test write queue',function(t){
  var api = valuefiles(__dirname+'/tmp');
  var c = 0;
  api.set('quick',1,function(err,data){
    t.ok(!err,"should not have error from write");
    c++;
    if(c == 3) done();
  });

  api.set('quick',2,function(err,data){
    t.ok(!err,"should not have error from write");
    c++;
    if(c == 3) done();
  });

  api.set('quick',3,function(err,data){
    t.ok(!err,"should not have error from write");
    c++;
    if(c == 3) done();
  });

  function done(){
    api.get('quick',function(err,value){
      t.equals(value,3,'the value read from the file after all of the writes should be three');
      t.end();
    });
  }

});
