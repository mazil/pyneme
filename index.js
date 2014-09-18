var fs = require('fs');
var path = require('path');
var http = require('http');

var random = function(min, max) {
	return ~~(Math.random() * (max - min + 1)) + min;
};


var shuffle = function(o){ //v1.0
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

var source = "lib/assets/pynes.json"
var images = [];

fs.readFile(path.join(__dirname, source), function (err, data){
	if (err) { return console.log(err); }
	images = JSON.parse(data);	
});

var server = http.createServer(function(req, res){

  var body = '';
  var pyne = '';
  var pynes = images.pynes;
  
  // Serve a specific pyne

  if (/pyne/.test(req.url)) {
  	
  	var url = req.url;
  	var s = "/pyne/";
  	
  	// Find the requested pyne
  	var pos = url.indexOf(s);
  	var pkey = url.substr(pos + s.length, url.length);
  	
  	pyne = pynes[pkey];

  	if (typeof pyne !== "undefined") {
	  	
	  	// Handle multi-pyne situations	  	
	  	pyne = (Array.isArray(pyne)) ? pyne[random(0, pyne.length - 1)] : pyne;
	  	
		body += '{ "pyne": "' + pyne + '", "name": "'+pkey+'" }';
	  	
	  	res.writeHead(200, {
	        'Content-Length': body.length,
	        'Content-Type': 'application/json' });
	        
	    return res.end(body); 
  	}
  	
  }
  
  // Serve a random pyne
  
  if (req.url === '/random') {

	// use the array keys to select a random pyne 
	var pyneKeys = Object.keys(pynes);
	shuffle(pyneKeys);
	
	pyne = pynes[pyneKeys[0]];
	
	// Handle multi-pyne situations	  	
  	pyne = (Array.isArray(pyne)) ? pyne[random(0, pyne.length - 1)] : pyne;
	
	body += '{ "pyne": "' + pyne + '", "name": "'+pyneKeys[0]+'" }';

    res.writeHead(200, {
        'Content-Length': body.length,
        'Content-Type': 'application/json' });
        
    return res.end(body);
  }
  
  if (req.url === '/') {

	body = "All the pynes."
    res.writeHead(200, {
        'Content-Length': body.length,
        'Content-Type': 'text/html' });
    return res.end(body);
    
  }  

  console.log('404');
  body = 'No pynes found. :(';
  res.writeHead(404, {
      'Content-Length': body.length,
      'Content-Type': 'text/html' });
  res.end(body);
});

server.listen(process.env.PORT || 5000, '0.0.0.0', function(){
  var info = server.address();
  console.info('Server listening on: http://' + info.address + ':' + info.port);
});
