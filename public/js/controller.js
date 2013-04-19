////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

var ready = false;

var socket = io.connect();

socket.on('id',function(data){
	socket.emit('id',{'id':'controller'});
});

socket.on('ready',function(data){
	ready = true;
});

var color = '#'+RGB2HTML(rand(255),rand(255),rand(255));
document.body.style.background = color;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

window.ondeviceorientation = function(event) {
	var y = (event.beta+90)/180;
	if(ready){
		socket.emit('controlData',{'y':y,'color':color});
	}
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

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////