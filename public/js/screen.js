var balls = {};
var maxSpeed = 20;

var socket = io.connect();

socket.on('id',function(data){
	socket.emit('id',{'id':'screen'});
});

//////////////////////////////////////////////////
//////////////////////////////////////////////////
//////////////////////////////////////////////////

socket.on('frame',function(data){

	var ctx = c.getContext('2d');
	ctx.fillStyle = '#000000';
	ctx.fillRect(0,0,theWidth,theHeight);

	for(var i in data.myUsers){
		ctx.fillStyle = data.myUsers[i].color;
		var x = data.myUsers[i].x*theWidth;
		var y = data.myUsers[i].y*theHeight;
		ctx.fillRect(x,y,30,30);
		document.getElementById('test').innerHTML = 'x: '+x+' - y: '+y;
		console.log(data);
	}
	// setTimeout(function(){
		socket.emit('frame',{});
	// },30);
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