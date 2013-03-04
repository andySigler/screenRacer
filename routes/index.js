var videoModel = require("../models/video.js");
var commentModel = require("../models/comment.js");
var moment = require('moment');

exports.index = function(req,res){

	videoModel.find({}, 'title id', function(err, allVideos){

		if (err) {
			res.send("Unable to query database for video").status(500);
		};

		var usedVideos = [];

		//flip the array so the newest one are at the beginning
		for(var i=allVideos.length-1,counter=0;i>=0;i--){
			usedVideos[counter] = allVideos[i];
			counter++
		}

		var templateData = {
			'title': 'ConVideo Home',
			'contentLinks' : usedVideos,
		};

		res.render('index.html', templateData);
	});
};

exports.video = function(req,res){

	var tempPath = req.path;
	var contentId = tempPath.split('/');

	var templateData;

	videoModel.findOne({'id':contentId[2]}, function(err, thisVid){
		commentModel.find({'id':contentId[2]},'name content start end', function(err,allComments){
			thisVid.comments = allComments;
			res.render('video.html', thisVid);
		});
	});
};

exports.newVideo = function(req,res){
	var tempVid = new videoModel({
		title : req.body.title,
		url : req.body.url,
		id : moment().format()
	});

	tempVid.save(function(err){
		if (err) {
			console.error("Error on saving new video");
			console.error(err);
			return res.send("There was an error when creating a new video");

		} else {
			// redirect to the astronaut's page
			res.redirect('/video/'+ tempVid.id)
		}
	});
};

exports.newComment = function(req,res){
	var tempPath = req.path;
	var contentId = tempPath.split('/');

	console.log(contentId[2]);

	var tempComment = new commentModel({
		name : req.body.name,
		content : req.body.content,
		start : req.body.start,
		end : req.body.end,
		id : contentId[2],
		realId : moment().format()
	});

	tempComment.save(function(err){
		if (err) {
			console.error("Error on saving new comment");
			console.error(err);
			return res.send("There was an error when creating a new comment");

		} else {
			// redirect to the astronaut's page
			res.redirect('/video/'+ contentId[2]);
		}
	});
};


videoModel.remove();

// videoModel.findOne({'title':'Vege Beats'}, function(err, thisVid){
// 	if(thisVid.id==null){
// 		var tempVid1 = new videoModel({
// 			title : 'Vege Beats',
// 			url : 'https://vimeo.com/60554403',
// 			id : moment().format()
// 		});
// 		tempVid1.save();
// 	}
// });

// videoModel.findOne({'title':'Vege Beats'}, function(err, thisVid){
// 	if(thisVid.id==null){
// 		var tempVid2 = new videoModel({
// 			title : 'Book Mapping',
// 			url : 'https://vimeo.com/60603629',
// 			id : moment().format()
// 		});
// 		tempVid2.save();
// 	}
// });

// videoModel.findOne({'title':'Vege Beats'}, function(err, thisVid){
// 	if(thisVid.id==null){
// 		var tempVid3 = new videoModel({
// 			title : '15,000 Volts',
// 			url : 'https://vimeo.com/60814695',
// 			id : moment().format()
// 		});
// 		tempVid3.save();
// 	}
// });

