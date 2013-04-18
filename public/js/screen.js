var socket = io.connect();

socket.on('id',function(data){
	socket.emit('id',{'id':'screen'})
});

socket.on('controlData',function(data){
	xSpeed = ((data.x*2)-1)*maxSpeed;
	y = data.y*theHeight;
});

socket.on('entry',function(data){
	isHere = true;
	if(data.direction<0){
		x=theWidth;
	}
	else{
		x=0;
	}
});

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

var c = document.getElementById('landscape');

var theWidth = window.innerWidth-7;
var theHeight = window.innerHeight-7;

c.width = theWidth;
c.height = theHeight;

var x = theWidth/2;
var y = theHeight/2;
var xSpeed = 0;
var maxSpeed = 30;

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

function drawLoop(){

	var ctx = c.getContext('2d');
	ctx.fillStyle = '#000000';
	ctx.fillRect(0,0,theWidth,theHeight);

	if(isHere){
		updateCoords();
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(x-20,y-20,40,40);
	}
	console.log(isHere);

	requestAnimFrame(function() {
        drawLoop();
    });
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

var isHere = false;

function updateCoords(){
	x+=xSpeed;
	if(x>theWidth){
		isHere = false;
		socket.emit('passOn',{'value':1})
	}
	else if(x<0){
		isHere = false;
		socket.emit('passOn',{'value':-1})
	}
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

window.onload = drawLoop();