///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

var port = process.env.PORT || 5000;

var express = require('express');
var app = express();
var server = require('http').createServer(app);
server.listen(port);

var io = require('socket.io').listen(server);
io.set('log level',1); //so there aren't constant debug messages

var path = require('path');

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

app.configure(function(){
	app.set('port', port);
	app.set('views', __dirname + '/views');

	app.set('view engine', 'html');
	app.set('layout', 'layout');
	app.engine('html', require('hogan-express'));

	app.use(express.favicon());
	app.use(express.bodyParser());
	app.use(express.methodOverride());

	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

var routes = require('./routes/routes.js');

app.get('/',routes.controller);
app.get('/screen',routes.screen);

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

var id=0;

var all = {
	'screen':[],
	'controller':{}
};

io.sockets.on('connection', function(s){

	var type;
	var speed = 5;
	var accel = 1.01;

	//initialization stuff
	s.emit('id',{});
	s.on('id',function(data){

		s.index = 0;
		type = data.id;

		if(data.id==='screen'){
			all[type].push(s); //add screen to an array
		}
		else if(data.id==='controller'){
			all[type][s.id] = s; //save controller according to ID
			s.emit('ready',{});
		}
	});

	//messages from the iPhone
	s.on('controlData',function(data){

		if(all.screen.length>0){

			data.id = s.id;
			data.speed = speed;
			speed*=accel;
			if(speed>100) speed = 5; //for testing

			//use the index of our saved copy, not the original
			if(all.controller[s.id]){
				if(all.screen[all.controller[s.id].index]===undefined){
					all.controller[s.id].index = 0;
				}
				all.screen[all.controller[s.id].index].emit('controlData',data);
			}
		}
	});

	//sent from a screen when the ball is off
	s.on('pass',function(data){
		all.controller[data.id].index+=1;
	});

	s.on('disconnect',function(){
		//if controller, delete it's ball, and erase from the storage
		if(all.controller[s.id]){
			s.broadcast.emit('delete',{'id':s.id});
			delete all.controller[s.id];
		}

		//if it's a screen, just delete it
		else{
			for(var i=0;i<all.screen.length;i++){
				if(all.screen[i].id===s.id){
					all[type].splice(i,1);
					break;
				}
			}
		}
	});
});

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////