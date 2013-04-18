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

var screenSockets = [];
var controllerSockets = [];

io.sockets.on('connection', function(socket){
	var isScreen = false;

	//save what role the browser will play
	socket.emit('id',{});
	socket.on('id',function(data){
		if(data.id==='screen'){
			screenSockets.push(socket);
			isScreen = true;
			for(var s=0;s<controllerSockets.length;s++){
				if(controllerSockets[s].currentScreen===screenSockets.length-1){
					socket.emit('entry',{});						//tells current screen to start counting it's x/y values
				}
			}
		}
		else if(data.id==='controller' && controllerSockets.length<3){
			socket.currentScreen = 0;										//save the current screen
			socket.player = controllerSockets.length+1				//save which 'player' this controller is
			controllerSockets.push(socket);
			if(screenSockets.length>0){
				screenSockets[socket.currentScreen].emit('entry',{});		//tells current screen to start counting it's x/y values
			}
		}
	});

	//pass on the data to this controller's screen
	socket.on('controlData',function(data){
		if(screenSockets.length>0){
			screenSockets[socket.currentScreen].emit('controlData',{'x':data.x,'y':data.y});
		}
	});

	//the 'passOn' message increments/decrements the current screen value
	socket.on('passOn',function(data){
		for(var n=0;n<screenSockets.length;n++){
			if(screenSockets[n]===socket){
				for(var b=0;b<controllerSockets.length;b++){
					if(controllerSockets[b].currentScreen===n){
						controllerSockets[b].currentScreen += data.value;
						if(controllerSockets[b].currentScreen<0){
							controllerSockets[b].currentScreen = screenSockets.length-1;
						}
						else if(controllerSockets[b].currentScreen===screenSockets.length){
							controllerSockets[b].currentScreen = 0;
						}
						if(screenSockets.length>0){
							screenSockets[controllerSockets[b].currentScreen].emit('entry',{'direction':data.value});			//tells current screen to start counting it's x/y values
						}
					}
				}
			}
		}
	});

	//erase the socket from either array upon disconnection
	socket.on('disconnect',function(){
		if(isScreen){
			for(var i=0;i<screenSockets.length;i++){
				if(screenSockets[i]===socket){
					screenSockets.splice(i,1);
				}
			}
		}
		else{
			for(var i=0;i<controllerSockets.length;i++){
				if(controllerSockets[i]===socket){
					controllerSockets.splice(i,1);
				}
			}
		}
	});
});

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////