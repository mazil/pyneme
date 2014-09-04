var fs = require('fs');
var http = require('http');
var path = require('path');
var trumpet = require('trumpet');
var hyperquest = require('hyperquest');
var rtc = 'http://realtimecats.com/';

var catz = [];

var server = http.createServer(function(req, res){
  var kitties = fs.readdirSync(path.join(__dirname, 'kitties'));
  body = 'We have ' + kitties.length + ' kitties! With ' + catz.length + ' still to come!';
  res.writeHead(200, {
      'Content-Length': body.length,
      'Content-Type': 'text/html' });
  res.end(body);
});

server.listen(process.env.PORT || 5000, '0.0.0.0', function(){
  var info = server.address();
  console.info('Server listening on: http://' + info.address + ':' + info.port);
});

var getCatz = function getCatz(kitties) {
  if (!catz.length) {
    server.close();
    return console.log('No more kitties');
  }
  var cat = kitties.shift();
  var file = path.join(__dirname, 'kitties', cat.split('/')[1]);
  var rs = hyperquest(rtc + cat);
  var ws = fs.createWriteStream(file);
  rs.pipe(ws);
  rs.on('error', function(err) {
    console.log('rs' + err);
  });
  rs.once('data', function() {
    getCatz(catz);
  });
  ws.on('error', function(err) {
    console.log('ws' + err);
  });
  ws.on('close', function() {
    console.log(cat + ' written.');
  });
};

var tr = trumpet();
tr.selectAll('img', function(img) {
  return catz.push(img.getAttribute('src'));
});

var rs = hyperquest(rtc);
rs.pipe(tr);
rs.on('end', function() {
  if (catz.length > 0)
    return getCatz(catz);
  throw(new Error('No kitties found?'));
});
