var fs = require('fs')
, path = require('path')
, EventEmitter = require('events').EventEmitter
;


module.exports = function(dir){
  var em = new EventEmitter();
  var _fdq = {};
  var _writeq = {};

  em.dir = dir;
  em.fds = {};
  em.writing = {};

  var _set = em.set = function(id,value,cb){
    console.log('set');
    if(em.writing[id]){
      if(!_writeq[id]) _writeq[id] = {value:value,cbs:[]};
      
      _writeq[id].value = value;
      _writeq[id].cbs.push(cb);
      return;

    }

    em.writing[id] = true;
    var doneWriting = function(err,data){
      delete em.writing[id];
      // if a write was queued while i was writing the old value make sure to commit the most recent value to the file.
      // fire all queued callbacks when that value has been committed
      if(_writeq[id]) {
        var value = _writeq[id].value
        ,cbs = _writeq[id].cbs
        ;

        delete _writeq[id];

        _set(id,_writeq[id].value,function(err,data){
          while(cbs.length) cbs.shift()(err,data);
        });
      };

      // fire callback.
      cb(err,data);
    };

    // serialize the value with json 
    try{
      value = JSON.stringify(value);
    } catch (e) {
      return process.nextTick(function(){
        doneWriting(e);
      });
    }

    em.getFd(id,function(err,fd){
      // if i couldnt get the fd.
      if(err) return doneWriting(err);
      fs.truncate(fd,0,function(err){
        // if truncate errored and i write it will result in an unpredictable value
        if(err) return doneWriting(err);
        // make buffer for write
        var buf = new Buffer(value);
        fs.write(fd,buf,0,buf.length,-3,function(err,data){
          doneWriting(err,data);
        });
      });
    });
  };

  em.get = function(id,cb){
    console.log('get',id);
    var z = this;

    em.getFd(id,function(err,fd){
      console.log('get fd ',err,fd);

      if(err) return cb(err);

      var file = z.idPath(id);

      fs.stat(file,function(err,stat){
        console.log('stat',err,stat);
        if(err) cb(err);

        var buf = new Buffer(+stat.size);
        fs.read(fd,buf,0,stat.size,0,function(err,bytes,buf){
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
    });
  };

  em.rm = function(id,cb){
    var idfile = this.idPath(id);
    em.free(id);
    delete em.writing[id];
    delete _writeq[id];
    fs.unlink(idpath,function(err,data){
      cb(err,data);
    });
  };

  em.free = function(id,cb) {
    var idfile = this.idPath(id);
    // this just closes the descriptor
    // if this is done it can break a pending set.
    // all callbacks for those pending sets will get the correct error callbacks.
    // in the future free wwill wait for all pending writes

    if(z.fds[idfile]) {
      fs.close(z.fds[idfile],cb);
      delete z.fds[idfile];
    } else process.nextTick(function(){
       cb(err,null); 
    });
  };

  em.getFd = function(id,cb){
    var idfile = this.idPath(id);
    var z = this;

    console.log('get fd');
    if(this.fds[idfile]) {
      process.nextTick(function(){
        cb(null,z.fds[idfile]);
      });
      return;
    }
    
    if(!_fdq[idfile]) _fdq[idfile] = [];
    _fdq[idfile].push(cb);

    if(this.fds[idfile] === false) return;
    this.fds[idfile] = false;

    fs.open(idfile,'a+',0655,function(err,fd){
        console.log('open ',idfile);
        if(z.fds[idfile] === false) z.fds[idfile] = fd;
        if(_fdq[idfile]) while(_fdq[idfile].length) _fdq[idfile].shift()(err,fd);
    });
  };

  em.idPath = function(id){
    var idfile = (new Buffer(''+id)).toString('base64');
    console.log('IDPATH ',path.join(this.dir,idfile));
    return path.join(this.dir,idfile);
  };

  return em;

};


