var path = require('path')
var express = require('express');
var app = express();
var http = require('http');

var fs = require('fs');
var https = require('https')
var options = {
  key: fs.readFileSync(path.join('certs', 'key.pem'), 'utf8'),
  cert: fs.readFileSync(path.join('certs', 'cert.pem'), 'utf8')
};

var serverHttps = https.createServer(options, app).listen(8001, function() {
  console.log('https starting on on localhost:8001')
});

var server = http.createServer(app).listen(8000, function() {
  console.log('http starting on on localhost:8000')
});

var ioHttps = require('socket.io')(serverHttps);
var io = require('socket.io')(server);


app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
  res.sendFile('public/index.html');
});

process.stdin.resume();
console.log('awaiting user input')
process.stdin.on('data', function(data) {
  data = data.toString()
  console.log('received input: ', data)
  io.sockets.emit('data', data);
  ioHttps.sockets.emit('data', data);
});
