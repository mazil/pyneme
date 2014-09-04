var fs = require('fs');
var path = require('path');
var http = require('http');
var random = function random(min, max) {
  return ~~(Math.random() * (max - min + 1)) + min;
};
var kitties = [];

fs.readdir(path.join(__dirname, 'kitties'), function(err, files){
  if (err)
    return console.error(err);
  if (!files.length)
    return console.error(new Error('No kitties found!'));
  kitties = files.map(function(kittie) {
    return 'kitties/' + kittie;
  });
});

var server = http.createServer(function(req, res){
  var body = '';
  var file = path.join(__dirname, req.url);
  var kittie;

  if (/^.kitties/.test(req.url) && fs.existsSync(file)) {
    kittie = fs.createReadStream(file);
    res.writeHead(200, {
        'Content-Length': fs.statSync(file).size,
        'Content-Type': 'image' + path.extname(file).replace('.','/').replace('jpg','jpeg') });
    return kittie.pipe(res);
  }
  if (req.url === '/') {
    body = '<img src="' + kitties[random(0, kitties.length - 1)] + '" />';
    res.writeHead(200, {
        'Content-Length': body.length,
        'Content-Type': 'text/html' });
    return res.end(body);
  }

  console.log('404');
  body = 'No kitties found. :(';
  res.writeHead(404, {
      'Content-Length': body.length,
      'Content-Type': 'text/html' });
  res.end(body);
});

server.listen(process.env.PORT || 5000, '127.0.0.1', function(){
  var info = server.address();
  console.info('Server listening on: http://' + info.address + ':' + info.port);
});
