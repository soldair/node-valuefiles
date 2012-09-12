var fs = require('fs');
var EventEmitter = require('events').EventEmitter;


module.exports = function(dir){
  var em = new EventEmitter();
  var _fdq = {};

  em.dir = dir;
  em.fds = {};
  em.set = function(id,value,cb){
    var val = JSON.stringify(value);
    em.getFd(id,function(err,fd){
      if(err) return cb(err);
      var buf = new Buffer(val);
      fs.write(fd,buf,0,buf.length,0,function(err,data){
        cb(err,data);
      });
    });
  };

  em.get = function(id,cb){
    em.getFd(id,function(err,fd){
      if(err) return cb(err);

      var buf = new Buffer();
      var file = this.idPath(id);

      fs.stat(file,function(err,stat){
        if(err) cb(err);

        fs.read(fd,buf,0,stat.size,0,function(err,buf){
          if(err) return cb(err);

          var result;
          try{
            result = JSON.parse(buf.toString());
          } catch(e){
            err = e;  
          }

          cb(err,result);
        });
      });
  };

  em.delete = function(id,cb){
    var idfile = this.idPath(id)
    fs.unlink(idpath,function(err,data){
      cb(err,data);

      if(z.fds[idfile]) fs.close(z.fds[idfile]);
      delete z.fds[idfile];
      delete _fdq[idfile];
    });
  };

  em.free = function(id,cb) {
    var idfile = this.idPath(id)

    if(z.fds[idfile]) fs.close(z.fds[idfile]);
    delete z.fds[idfile];
    delete _fdq[idfile];
    process.netxTick(function(){
       cb(err,null); 
    });
  };

  em.getFd = function(id,cb){
    var idfile = (new Buffer(''+id)).toString('base64');
    if(this.fds[idfile]) {
      process.nextTick(function(){
        cb(null,this.fds[idfile]);
      });
    }
    
    if(!_fdq[idfile]) _fdq[idfile] = [];
    _fdq[idfile].push(cb);

    if(this.fds[idfile] === false) return;
    this.fds[idfile] = false;

    var z = this;
    fs.open(idfile,'r+',0655,function(err,fd){
        if(z.fds[idfile]) z.fds[idfile] = fd;
        if(_fdq[idfile]) while(_fdq[idfile].length) _fdq[idfile].shift()(err,fd);
    });
  };

  em.idPath = function(id){
    var idfile = (new Buffer(''+id)).toString('base64');
    return this.dir+idfile;
  };

  return em;

};


