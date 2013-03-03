exports.index = function(req,res){
	var templateData = {
		"title": "ConVideo Home",
		
		"contentLinks": [
			{
				"id": "someNumber",
				"title": "some dumb video"
			}.
			{
				"id": "anotherNumber",
				"title": "some dumb video, again"
			}.
			{
				"id": "thisNumber",
				"title": "another dumb video, again"
			}
		]
	}

	res.render('index.html', templateData);
});