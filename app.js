

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

var port = 5000;
var fs = require('fs');
var url = require('url');

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

var server = require('http').createServer(function(request,response){

	var pathname = url.parse(request.url).pathname;
	response.writeHead(200, {"Content-Type": "text/html"});

	if(pathname==='/screen'){
			fs.readFile('./views/screen.html',function(error,html){
			if(error){
				console.log('error loading screen file');
				console.log(error);
				response.write('error loading screen file');
				response.end();
			}
			else{
				response.write(html);
				response.end();
			}
		});
	}

	else if(pathname==='/'){
			fs.readFile('./views/controller.html',function(error,html){
			if(error){
				console.log('error loading controller file');
				console.log(error);
				response.write('error loading controller file');
				response.end();
			}
			else{
				response.write(html);
				response.end();
			}
		});
	}

	else{
		response.write('yo no se');
		response.end();
	}
});

server.listen(port);

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

var user = {};
var screens = [];

var id = 0;

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({'port': 8080});

wss.on('connection', function(s){
	console.log('A;SLDKFJ');
	id++;

	var last;

	s.id = id;

	//initialize the socket, either user or screen
	s.send(JSON.stringify({'tag':'id'}));

	s.on('message',function(msg){

		var parsedMsg = JSON.parse(msg);
		if(parsedMsg.tag==='id'){
			setID(parsedMsg);
		}
		else if(parsedMsg.tag==='update'){
			updateUser(parsedMsg);
		}
		else if(parsedMsg.tag==='frame'){
			frame(parsedMsg);
		}
	});

	function setID(data){
		if(data.id==='user'){
			s.index = 0; //what screen are we on?
			s.x = .5; //where are we on that screen?
			s.y = .5;
			s.px = .5; //saving previous locations for filtering
			s.py = .5;
			s.xSpeed = 0;
			s.ySpeed = 0;
			s.color = data.color;
			user[s.id] = s;
			s.send(JSON.stringify({'tag':'update'})); //start the handshake method
		}
		else if(data.id==='screen'){
			screens.push(s);
			s.send(JSON.stringify({'tag':'frame'}));
		}
	};

	//handshake method for the controlling broswers
	function updateUser(data){

		var maxSpeed = 1;


		user[s.id].xSpeed = data.xSpeed*maxSpeed;
		user[s.id].ySpeed = data.ySpeed*maxSpeed;

		s.send(JSON.stringify({'tag':'update'}));
	};

	//handshake method for the screen browser
	function frame(data){

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
		s.send(JSON.stringify({'tag':'frame','myUsers':myUsers}));
	};

	//delete the user or screen when they leave
	s.on('close',function(){
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

var xSlide = 10;
var ySlide = 15;

setInterval(function updateUser(){
	for(var i in user){

		//filtering
		user[i].x = user[i].x + (((user[i].x + user[i].xSpeed)-user[i].x)/xSlide);
		user[i].y = user[i].y + (((user[i].y + user[i].ySpeed)-user[i].y)/ySlide);

		if(user[i].x>=1){
			user[i].index++;
			user[i].x = 0;
			if(user[i].index>=screens.length){
				user[i].index=0;
			}
		}
		else if(user[i].x<0){
			user[i].index--;
			user[i].x = 1;
			if(user[i].index<0){
				user[i].index = screens.length-1;;
			}
		}
	}
},30);

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////