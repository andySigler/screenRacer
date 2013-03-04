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
				"id": "someId1",
				"name": "Ivana Humpalot",
				"content": "my vid sux",
				"start": 1,
				"end": 3
			},
			{
				"id": "someId2",
				"name": "Pete Sweeney",
				"content": "my vid rox",
				"start": 2,
				"end": 3
			},
			{
				"id": "someId3",
				"name": "My Mom",
				"content": "I'm not mad, just disappointed",
				"start": 2,
				"end": 6
			}
		]

		//'popcornCode': corn.assemble();
	}
	res.render('content.html', templateData);
};