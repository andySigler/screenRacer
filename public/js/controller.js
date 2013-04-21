////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

var speed = 0;
var y = .5;

var socket = io.connect();

var r = rand(255);
var g = rand(255);
var b = rand(255);

var color = '#'+RGB2HTML(r,g,b);
var textColor = '#'+RGB2HTML(255-r,255-g,255-b);
document.body.style.background = color;
document.getElementById('test').style.color = textColor;

socket.on('id',function(data){
	socket.emit('id',{'id':'user','color':color});
});

socket.on('update',function(data){

	socket.emit('update',{'speed':speed,'y':y});
});

socket.on('time',function(data){
	var d = new Date();
	var now = d.getTime();

	var toUserDelay = now-data.sentTime;
	
	console.log('toServer: '+data.toServerDelay+' --- toUserDelay: '+toUserDelay);

	socket.emit('time',{'sentTime': now});
});

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

window.ondeviceorientation = function(event) {
	y = (event.beta+90)/180;
	speed = event.gamma/90;
};

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

function RGB2HTML(red, green, blue){
    var decColor = red + 256 * green + 65536 * blue;
    return decColor.toString(16);
}

function rand(max){
	return Math.floor(Math.random()*max);
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////