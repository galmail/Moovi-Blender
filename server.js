var express = require('express');
var app = express();



// eg. blender -b scripts/ready.blend --debug --background --python scripts/render_movie.py -- "/Users/gal/Desktop/gruvid/gruvidblender/input/video1.mp4" "/Users/gal/Desktop/gruvid/gruvidblender/input/video2.mp4" --render="/Users/gal/Desktop/gruvid/gruvidblender/output/"
app.get('/render', function (req, res) {
  console.log('VIDEOS: ' + req.query.videos);
  console.log('OUTPUT: ' + req.query.output);
  var success = true;
  var msg = "";

  // invoke blender script
  var sys = require('sys');
  var exec = require('child_process').exec;
  //var blender = "/Users/gal/Desktop/gruvid/blenderTest/blender.app/Contents/MacOS/blender";
  var blender = "blender";
  var cmd = blender + " -b scripts/ready.blend --debug --background --python scripts/render_movie.py -- " +
    req.query.videos.join(' ') +
    " --render=" +
    req.query.output;

  console.log('CMD: ' + cmd);

  exec(cmd, function(error, stdout, stderr){
    if(error || stderr){
      success = false;
      msg = stderr;
    }
    else {
      success = true;
      msg = cmd;
    }


    var lastFrame = String(stdout.match(/__frame_end=\d+/g)).split('=').pop();

    console.log('Last Frame is: ' + lastFrame);







    //TODO report back to the server that the video is ready



  });

  res.json({ rendering: true });

});



////////// STARTING SERVER //////////

var port = process.env.PORT || 80;

app.listen(port);

console.log("Node.js is running in " + app.get('env') + " on port " + port);

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});

