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

var user = {};
var screens = [];

io.sockets.on('connection', function(s){

	//initialize the socket, either user or screen
	s.emit('id',{});
	s.on('id',function(data){
		if(data.id==='user'){
			s.index = 0; //what screen
			s.x = .5;
			s.y = .5;
			s.speed = 0;
			s.color = data.color;
			user[s.id] = s;
			s.emit('update',{});
		}
		else if(data.id==='screen'){
			screens.push(s);
			s.emit('frame',{});
		}
	});

	//handshake method for the users
	s.on('update',function(data){
		updateUser(s.id,data);
		s.emit('update',{});
	});

	//handshake method for the screens
	s.on('frame',function(){

		var myUsers = [];

		for(var h=0;h<screens.length;h++){
			if(screens[h].id===s.id){
				for(var u in user){
					if(user[u].index===h){
						var tempUser = {
							'x':user[u].x,
							'y':user[u].y,
							'color':user[u].color
						};
						myUsers.push(tempUser);
					}
				}
				break;
			}
		}
		s.emit('frame',{'myUsers':myUsers});
	});

	//delete the user or screen when they leave
	s.on('disconnect',function(){
		if(user[s.id]){
			delete user[s.id];
			console.log('lost a user');
		}
		else{
			for(var i=0;i<screens.length;i++){
				if(screens[i].id===s.id){
					screens.splice(i,1);
					console.log('lost a screen');
					break;
				}
			}
		}
	});
});

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

var maxSpeed = 0.005;

function updateUser(id,data){
	if(screens.length>0){

		user[id].speed = data.speed*maxSpeed;
		user[id].x += user[id].speed;
		user[id].y = data.y;

		if(user[id].x>=1){
			user[id].index++;
			user[id].x = 0;
			if(user[id].index>=screens.length){
				user[id].index=0;
			}
		}
		else if(user[id].x<0){
			user[id].index--;
			user[id].x = 1;
			if(user[id].index<0){
				user[id].index = screens.length-1;;
			}
		}
	}
}

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////