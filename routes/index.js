var videoModel = require("../models/video.js");
var commentModel = require("../models/comment.js");
var moment = require('moment');

exports.index = function(req,res){

	videoModel.find({}, 'title', function(err, allVideos){

		if (err) {
			res.send("Unable to query database for video").status(500);
		};

		var usedVideos = [];

		//flip the array so the newest one are at the beginning
		for(var i=allVideos.length-1,counter=0;i>=0;i--){
			usedVideos[counter] = allVideos[i];
			counter++;
		}

		var templateData = {
			'title': 'ConVodeo Home',
			'videoLinks' : usedVideos,
		};

		res.render('index.html', templateData);
	});
};

exports.video = function(req,res){

	var tempPath = req.path;
	var contentId = tempPath.split('/')[2];

	var templateData;

	videoModel.findOne({'_id':contentId}, function(err, thisVid){
		commentModel.find({'parentId':thisVid._id},'name comment start end', function(err,allComments){
			console.log(allComments);
			var videoData = {
				'video': thisVid,
				'comments' : allComments,
			};
			res.render('video.html', videoData);
		});
	});
};

exports.newVideo = function(req,res){
	var tempVid = new videoModel({
		title : req.body.title,
		url : req.body.url,
	});

	tempVid.save(function(err){
		if (err) {
			console.error("Error on saving new video");
			console.error(err);
			return res.send("There was an error when creating a new video");

		} else {
			// redirect to the video's page
			res.redirect('/video/'+ tempVid.id)
		}
	});
};

exports.newComment = function(req,res){
	var tempPath = req.path;
	var temp_vidId = tempPath.split('/')[2];

	var tempComment = new commentModel({
		name : req.body.name,
		comment : req.body.content,
		start : req.body.start,
		end : req.body.end,
		parentId : temp_vidId
	});

	tempComment.save(function(err){
		if (err) {
			console.error("Error on saving new comment");
			console.error(err);
			return res.send("There was an error when creating a new comment");

		} else {
			// redirect to the video's page
			res.redirect('/video/'+ temp_vidId);
		}
	});
};
