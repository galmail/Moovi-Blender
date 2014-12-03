var express = require('express');
var httpProxy = require('http-proxy');
var request = require('request');
var app = express();

////////// STATIC FILES CONFIGURATION //////////

// switch(app.get('env')) {
//   case 'development':
//     app.use(express.static(__dirname + '/www', {
//       maxAge : 0
//     }));
//     break;
//   case 'production':
//     app.use(express.static(__dirname + '/www', {
//       maxAge : 0
//     }));
//     app.use(express.compress());
//     break;
//   default:
//     return;
// }

////////// PROXY SERVER CONFIGURATION //////////

// app.all(/api\//, function(req, res, next){
//   var url = 'http://gruvid.herokuapp.com' + req.url;
//   reqpipe(req, url, res);
// });

// app.all(/users\//, function(req, res, next){
//   var url = 'http://gruvid.herokuapp.com' + req.url;
//   reqpipe(req, url, res);
// });

// function reqpipe(req, url, res) {
//   var start = new Date();
//   process.stdout.write('Calling: ' + url);
//   req.pipe(request(url)).pipe(res); 
//   console.log('  ' + (new Date()- start) + " ms");
// }

////////// STARTING SERVER //////////

app.listen(process.env.PORT || 3000);

console.log("Node.js is running in " + app.get('env'));

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});

