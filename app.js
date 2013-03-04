var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var moment = require('moment');

//express stuff
var app = express();

//by not giving a first argument to .configure, this function applies
//to the entire app
app.configure(function(){
	app.set('port', process.env.PORT || 9000);

	//where our template directory is
	app.set('views', __dirname + '/views');
	//what compiles our pages from '/views' will be called 'html'
	app.set ('view engine','html');
	//looks inside our '/views' folder, sets the layout to our 'layout' file
	app.set('layout','layout');
	//that 'html' engine is technically the hogan-express engine
	app.engine('html',require('hogan-express'));

	app.use(express.favicon());
  	app.use(express.bodyParser());
  	app.use(express.methodOverride());
  	app.use(app.router);
  	app.use(express.static(path.join(__dirname, 'public')));
  	app.db = mongoose.connect(process.env.MONGOLAB_URI);
});



//routing stuff
var routes = require(__dirname + '/routes/index.js');

app.get('/',routes.index);
app.get('/video/*',routes.video);
app.post('/newVideo',routes.newVideo);
app.post('/newComment/*',routes.newComment);



//and finally, make the server
http.createServer(app).listen(app.get('port'),function(){
	console.log('http server listening at port ' + app.get('port'));
});

