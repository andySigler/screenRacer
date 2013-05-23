/*

 ####  ###### #####  #    # ######    ###### # #      ######  ####  
#      #      #    # #    # #         #      # #      #      #      
 ####  #####  #    # #    # #####     #####  # #      #####   ####  
     # #      #####  #    # #         #      # #      #           # 
#    # #      #   #   #  #  #         #      # #      #      #    # 
 ####  ###### #    #   ##   ######    #      # ###### ######  #### 

*/

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
	if(pathname==='/screen'){
		response.writeHead(200, {"Content-Type": "text/html"});
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
		response.writeHead(200, {"Content-Type": "text/html"});
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

	else if(pathname==='/copter.png'){
		response.writeHead(200, {"Content-Type": "image/png"});
		fs.readFile('./copter.png',function(error,img){
			if(error){
				console.log('error loading copter image');
				console.log(error);
				response.write('error loading copter image');
				response.end();
			}
			else{
				response.write(img);
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

/*

#    # ###### #####   ####   ####   ####  #    # ###### #####  ####  
#    # #      #    # #      #    # #    # #   #  #        #   #      
#    # #####  #####   ####  #    # #      ####   #####    #    ####  
# ## # #      #    #      # #    # #      #  #   #        #        # 
##  ## #      #    # #    # #    # #    # #   #  #        #   #    # 
#    # ###### #####   ####   ####   ####  #    # ######   #    ####  

*/

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

var user = {};
var screens = [];

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({'port': 8080});

var currentScreen = null;
var currentName = null;

var count = 0;
var pScreenName = 0;

var highScore = [];

wss.on('connection', function(s){

	s.name=count;
	count++;

	//initialize the socket, either user or screen
	s.send(JSON.stringify({'tag':'id'}));

	/*

	#####   ####  #    # ##### ###### #####  
	#    # #    # #    #   #   #      #    # 
	#    # #    # #    #   #   #####  #    # 
	#####  #    # #    #   #   #      #####  
	#   #  #    # #    #   #   #      #   #  
	#    #  ####   ####    #   ###### #    #  

	*/

	s.on('message',function(msg){
		var parsedMsg = JSON.parse(msg);
		if(parsedMsg.tag==='id'){
			setID(parsedMsg); //get the id (screen or user)
		}
		else if(parsedMsg.tag==='update'){
			updateUser(parsedMsg); //get speed from user, and pass on to current screen
		}
		else if(parsedMsg.tag==='passOn'){
			passOn(parsedMsg);
		}
		else if(parsedMsg.tag==='fillPass'){
			fillPass(parsedMsg);
		}
		else if(parsedMsg.tag==='startGame'){
			startGame();
		}
		else if(parsedMsg.tag==='gameOver'){
			try{
				highScore.push(user[currentName].life);
				for(var h=1;h<highScore.length;h++){
					if(highScore[h]===highScore[h-1]){
						highScore.splice(h,1);
						h--;
					}
				}
				highScore.sort(function(a,b){
					return b-a;
				});
				highScore = highScore.splice(0,7);
				user[currentName].send(JSON.stringify({
					'tag':'gameOver',
					'score':user[currentName].life,
					'highScore': highScore
				}));
			}
			catch(err){
				console.log('the loser is already disconnected');
				console.log('threw error: '+err);
			}
		}
		else if(parsedMsg.tag==='score'){
			if(user[currentName]){
				try{
					user[currentName].send(JSON.stringify({
						'tag':'score',
						'hit':parsedMsg.hit
					}));
				}
				catch(err){}
			}
		}
	});

	/*

	# #    # # ##### #   ##   #      # ###### ###### 
	# ##   # #   #   #  #  #  #      #     #  #      
	# # #  # #   #   # #    # #      #    #   #####  
	# #  # # #   #   # ###### #      #   #    #      
	# #   ## #   #   # #    # #      #  #     #      
	# #    # #   #   # #    # ###### # ###### ###### 

	*/

	function startGame(){
		if(currentName!=null && currentScreen!=null){
			sendBirth(.03,.5,0);
			//start the handshake method
			if(user[currentName]) user[currentName].send(JSON.stringify({'tag':'update'}));
		}
	}

	function setID(data){
		if(data.id==='user'){
			s.id='user';
			user[s.name] = s;
			user[s.name].index = 0; //what screen are we on?
			user[s.name].xSpeed = 0;
			user[s.name].yPos = 0;
			user[s.name].color = data.color;
			user[s.name].life = 0;
			user[s.name].hit = 0;
			if(currentName===null) {
				prepareNewUser(s.name);
			}
		}
		else if(data.id==='screen'){
			s.id='screen';
			screens.push(s);
			if(currentScreen===null){
				currentScreen=0;
			}
			screenOrder();
		}
	};

	function prepareNewUser(tempName){
		currentName = tempName;
		if(user[currentName]){
			user[currentName].send(JSON.stringify({
				'tag':'firstInLine',
				'highScore': highScore
		}));
			for(var i=0;i<screens.length;i++){
				screens[i].send(JSON.stringify({'tag':'restart'}));
			}
		}
	}

	function screenOrder(){
		for(var i=0;i<screens.length;i++){
			if(screens[i]){
				screens[i].send(JSON.stringify({
					'tag':'order',
					'value':i+1
				}));
			}
		}
	}

	/*

	 ####   ####  #    # ##### #####   ####  #         # #    # 
	#    # #    # ##   #   #   #    # #    # #         # ##   # 
	#      #    # # #  #   #   #    # #    # #         # # #  # 
	#      #    # #  # #   #   #####  #    # #         # #  # # 
	#    # #    # #   ##   #   #   #  #    # #         # #   ## 
	 ####   ####  #    #   #   #    #  ####  ######    # #    # 

	*/

	//handshake method for the controlling broswers
	function updateUser(data){

		user[currentName].xSpeed = data.xSpeed;
		user[currentName].yPos = data.yPos;

		if(screens[currentScreen]){

			//send the new speed to the specified screen
			screens[currentScreen].send(JSON.stringify({
				'tag':'updateSpeeds',
				'xSpeed': user[currentName].xSpeed,
				'yPos': user[currentName].yPos
			}));
			s.send(JSON.stringify({'tag':'update'}));
		}
		else if(screens.length>0){
			currentScreen++;
			if(currentScreen>=screens.length){
				currentScreen=0;
			}
			sendBirth(user[currentName].x,user[currentName].y,user[currentName].life);
		}
		else{
			currentScreen=null;
		}
	};

	/*

	#####    ##    ####   ####      ####  #    # 
	#    #  #  #  #      #         #    # ##   # 
	#    # #    #  ####   ####     #    # # #  # 
	#####  ######      #      #    #    # #  # # 
	#      #    # #    # #    #    #    # #   ## 
	#      #    #  ####   ####      ####  #    # 

	*/

	function passOn(msg){
		try{
			user[currentName].life++;
			user[currentName].hit = msg.hit;
			if(msg.x<.5){
				currentScreen++;
				if(currentScreen===screens.length){
					currentScreen=0;
				}
			}
			else if(msg.x>.5){
				currentScreen--;
				if(currentScreen<0) {
					currentScreen=screens.length-1;
				}
			}
			sendBirth(msg.x,msg.y,user[currentName].life);
		}
		catch(err){
			console.log('could not send birth, it is gone!')
		}
	}

	//creates a user ball on a screen
	function sendBirth(x,y,life){
		if(screens[currentScreen]){
			screens[currentScreen].send(JSON.stringify({
				'tag':'birth',
				'xSpeed': user[currentName].xSpeed,
				'color': user[currentName].color,
				'x': x,
				'y': y,
				'life':life,
				'hit':user[currentName].hit
			}));
		}
	}

	function fillPass(msg){
		for(var i=0;i<screens.length;i++){
			if(screens[i].name===s.name){
				var tempIndex = i+1;
				if(tempIndex===screens.length) tempIndex=0;
				screens[tempIndex].send(JSON.stringify({
					'tag': 'fillPass',
					'index':msg.index,
					'center':msg.center,
					'life': msg.life
				}));
			}
		}
	}

	/*

	 ####   ####   ####  #    # ###### #####     ####  #       ####   ####  ###### #####  
	#      #    # #    # #   #  #        #      #    # #      #    # #      #      #    # 
	 ####  #    # #      ####   #####    #      #      #      #    #  ####  #####  #    # 
	     # #    # #      #  #   #        #      #      #      #    #      # #      #    # 
	#    # #    # #    # #   #  #        #      #    # #      #    # #    # #      #    # 
	 ####   ####   ####  #    # ######   #       ####  ######  ####   ####  ###### #####  

	*/

	//delete the user or screen when they leave
	s.on('close',function(){
		if(s.id==='user'){
			delete user[currentName];
			currentName = null;
			for(var u in user){
				try{
					prepareNewUser(user[u].name);
					break;
				}
				catch(err){}
			}
			if(screens[currentScreen]){
				screens[currentScreen].send(JSON.stringify({
					'tag':'death'
				}));
				if(screens[currentScreen+1]){
					screens[currentScreen+1].send(JSON.stringify({
						'tag':'death'
					}));
					currentScreen=0;
				}
				else if(screens[0]){
					screens[0].send(JSON.stringify({
						'tag':'death'
					}));
					currentScreen=0;
				}
			}
		}
		else{
			for(var i=0;i<screens.length;i++){
				if(screens[i].name===s.name){
					screens.splice(i,1);
					break;
				}
			}
			screenOrder();
		}
	});
});

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////