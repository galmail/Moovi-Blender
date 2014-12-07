var express = require('express');
var http = require('http');
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

    var video_name = String(stdout.match(/RenderedVideo=\d+-\d+.mov/g)).split('=').pop();
    console.log('Video Name: ' + video_name);

    var _out = req.query.output.split('/');
    var video_id = _out[_out.length-2];
    var url = req.query.output + video_name;

    var options = {
      host: 'http://gruvid.herokuapp.com',
      port: 80,
      path: '/api/v1/video_is_ready?id='+ video_id + '&url=' + url,
      method: 'POST'
    };

    http.request(options, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      // res.on('data', function (chunk) {
      //   console.log('BODY: ' + chunk);
      // });
    }).end();

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

