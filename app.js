

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

var port = 5000;
var fs = require('fs');
var url = require('url');

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
	s.id = id; //give it an arbitrary id that increments
	id++;

	//initialize the socket, either user or screen
	s.send(JSON.stringify({'tag':'id'}));

	s.on('message',function(msg){
		var parsedMsg = JSON.parse(msg);
		if(parsedMsg.tag==='id'){
			setID(parsedMsg); //get the id (screen or user)
		}
		else if(parsedMsg.tag==='update'){
			updateUser(parsedMsg); //get speed from user, and pass on to current screen
		}
		else if(parsedMsg.tag==='frame'){
			frame(parsedMsg);
		}
		else if(parsedMsg.tag==='death'){
			onDeath(parsedMsg);
		}
	});

	//passing on the birth message to the next screen if we've moved on
	function onDeath(msg){
		for(var b=0;b<screens.length;b++){
			//find this screen's location in the array, and send to the next one (left or right)
			if(screens[b].id===s.id){

				var tempIndex;

				//the next index depends on which direction we're moving
				if(msg.x<.5){
					tempIndex = b+1;
					if(tempIndex===screens.length){
						tempIndex=0;
					}
				}
				else if(msg.x>.5){
					tempIndex = b-1;
					if(tempIndex<0) {
						tempIndex=screens.length-1;
					}
				}

				sendBirth(msg.userName,tempIndex,msg.x,msg.y);
				break;
			}
		}
	}

	function setID(data){
		if(data.id==='user'){
			s.index = 0; //what screen are we on?
			s.xSpeed = 0;
			s.ySpeed = 0;
			s.color = data.color;
			user[s.id] = s;
			s.send(JSON.stringify({'tag':'update'})); //start the handshake method
			if(screens.length>0){
				sendBirth(s.id,s.index,.5,.5);
			}
		}
		else if(data.id==='screen'){
			screens.push(s);
			screenBirth();
		}
	};

	//handshake method for the controlling broswers
	function updateUser(data){

		user[s.id].xSpeed = data.xSpeed;
		user[s.id].ySpeed = data.ySpeed;

		if(screens[user[s.id].index]){

			//send the new speed to the specified screen
			screens[user[s.id].index].send(JSON.stringify({
				'tag':'updateSpeeds',
				'xSpeed': user[s.id].xSpeed,
				'ySpeed': user[s.id].ySpeed,
				'userName': s.id
			}));
		}
		else if(screens.length>0){
			user[s.id].index=0;
		}
		else{
			console.log('shit did not work, we only have '+screens.length+' screens');
		}

		// tell controller we're ready for more
		s.send(JSON.stringify({'tag':'update'}));
	};

	//if this is a new screen, loop through all users, and send birth message if needed
	function screenBirth(){
		if(screens.length>0){
			for(var u in user){
				//if any user's index is the newest screen, birth a user on that client
				if(user[u].index<=screens.length-1){
					//initialize a new user on the screen
					sendBirth(u,user[u].index,0.5,0.5);
				}
				else{
					while(user[u].index>=screens.length){
						user[u].index--;
					}
					sendBirth(u,user[u].index,0.5,0.5);
				}
			}
		}
	}

	//creates a user ball on a screen
	function sendBirth(userID,newScreenIndex,x,y){
		if(screens[newScreenIndex]){
			user[userID].index = newScreenIndex;
			screens[newScreenIndex].send(JSON.stringify({
				'tag':'birth',
				'userName': userID,
				'xSpeed': user[userID].xSpeed,
				'ySpeed': user[userID].ySpeed,
				'color': user[userID].color,
				'x': x,
				'y': y
			}));
		}
	}

	//delete the user or screen when they leave
	s.on('close',function(){
		if(user[s.id]){
			for(var h=0;h<screens.length;h++){
				screens[h].send(JSON.stringify({
					'tag':'death',
					'userName':s.id
				}));
			}
			delete user[s.id];
		}
		else{
			for(var i=0;i<screens.length;i++){
				if(screens[i].id===s.id){
					screens.splice(i,1);
					screenBirth();
					break;
				}
			}
		}
	});
});

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////