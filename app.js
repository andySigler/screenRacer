///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

var port = process.env.PORT || 5000;
var fs = require('fs');
var url = require('url');

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

var controllerHTML;
var screenHTML;

fs.readFile('./views/controller.html',function(error,html){
	if(error){
		console.log('error loading controller file');
	}
	else{
		controllerHTML = html;
	}
});

fs.readFile('./views/screen.html',function(error,html){
	if(error){
		console.log('error loading screen file');
	}
	else{
		screenHTML = html;
	}
});

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

var server = require('http').createServer(function(request,response){
	var pathname = url.parse(request.url).pathname;
	response.writeHead(200, {"Content-Type": "text/html"});
	if(pathname==='/screen'){
		response.write(screenHTML);
	}
	else if(pathname==='/'){
		response.write(controllerHTML);
	}
	else{
		response.write('yo no se');
	}
	response.end();
});

server.listen(port);

var io = require('socket.io').listen(server);
io.set('log level',1); //so there aren't constant debug messages

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

var user = {};
var screens = [];

io.sockets.on('connection', function(s){

	var last;

	//initialize the socket, either user or screen
	s.emit('id',{});
	s.on('id',function(data){
		if(data.id==='user'){
			s.index = 0; //what screen are we on?
			s.x = .5; //where are we on that screen?
			s.y = .5;
			s.px = .5; //saving previous locations for filtering
			s.py = .5;
			s.speed = 0;
			s.color = data.color;
			user[s.id] = s;
			s.emit('update',{}); //start the handshake method
		}
		else if(data.id==='screen'){
			screens.push(s);
			s.emit('frame',{});
		}
	});

	//handshake method for the controlling broswers
	s.on('update',function(data){

		updateUser(s.id,data);

		s.emit('update',{});
	});

	//handshake method for the screen browser
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

var maxSpeed = 0.01;
var xSlide = 10;
var ySlide = 150;

function updateUser(id,data){
	if(screens.length>0){

		user[id].speed = data.speed*maxSpeed;

		//filtering
		user[id].x = user[id].x + (((user[id].x + user[id].speed)-user[id].x)/xSlide);
		user[id].y = user[id].y + ((data.y-user[id].y)/ySlide);

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