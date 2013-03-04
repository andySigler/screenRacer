var corn = require(__dirname + '')

exports.index = function(req,res){
	var templateData = {
		"title": "ConVideo Home",

		"contentLinks": [
			{
				"id": "someNumber",
				"title": "some dumb video"
			},
			{
				"id": "anotherNumber",
				"title": "some dumb video, again"
			},
			{
				"id": "thisNumber",
				"title": "another dumb video, again"
			}
		],

		"popcornCode": ""
	}

	res.render('index.html', templateData);
};

exports.content = function(req,res){
	var templateData = {
		'title': 'This Submission\'s Title',

		"comments": [
			{
				"name": "Ivana Humpalot",
				"content": "this vid sux"
			},
			{
				"name": "Pete Sweeney",
				"content": "this vid rox"
			},
			{
				"name": "My Mom",
				"content": "I'm not mad, I'm just disappointed"
			}
		]

		//'popcornCode': corn.assemble();
	}
	res.render('content.html', templateData);
};