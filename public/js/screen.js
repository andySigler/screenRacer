var balls = {};
var maxSpeed = 20;

var socket = io.connect();

socket.on('id',function(data){
	socket.emit('id',{'id':'screen'});
});

socket.on('delete',function(data){
	delete balls[data.id];
});

socket.on('controlData',function(data){
	if(balls[data.id]===undefined || balls[data.id]===NaN){
		var temp = {
			'x': 0,
			'y': data.y*theHeight,
			'speed': data.speed,
			'color': data.color
		}
		balls[data.id] = temp;
	}
	else{
		balls[data.id].y = data.y*theHeight;
		balls[data.id].speed = data.speed;
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

	for(var b in balls){
		ctx.fillStyle = balls[b].color;
		console.log(balls[b]);
		balls[b].x+=balls[b].speed;
		if(balls[b].x>theWidth){
			socket.emit('pass',{'id':b,'speed':balls[b].speed})
			delete balls[b];
		}
		else{
			ctx.fillRect(balls[b].x,balls[b].y,30,30);
		}
	}

	requestAnimFrame(function() {
        drawLoop();
    });
}

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

window.onload = drawLoop();

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////