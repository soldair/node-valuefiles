# valuefiles

Get/Set/Delete one value per file opening as few file descriptors as possible

## example

```js
var api = require('valuefiles');
var api = valuefiles('./files/');
api.set('key',1,function(err,data){
  api.get('key',function(err,data){
    console.log(data)//prints 1
  });
})

```

## description

I use this to keep track of a few key values each in it's own file. This package is not for caching lots of keys and is not fast.
Its useful for tracking state to resume batch processing after a crash and optimized more for write than read.

## constructor

valuefiles(directory)
 - directory is the directory to store the key value files

## api

get (key,cb)
 - gets the value of a key

set (key,value,cb)
 - sets a key to value

rm (key,cb)
  - deletes the key file and frees the file descritor

free (key,cb)
  - closes the file descriptor and any pending actions for the key


