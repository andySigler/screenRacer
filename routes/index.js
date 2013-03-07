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

	//find this video's id
	var tempPath = req.path;
	var contentId = tempPath.split('/')[2];

	//create the object we're using to send our data into html
	var videoData = {
		'contents' : [],
		'video' : {}
	};

	//our recursive function...
	function findChildren(tempId , finisher , func){

		commentModel.find({'parentId':tempId},'name comment start end parentId', function(err,subContent){
			if(subContent.length>0){
				finisher = false;
				for(var a=0;a<subContent.length;a++){
					videoData.contents.push(subContent[a]);
					if(a===subContent.length-1){ 
						findChildren(subContent[a]._id,true,func);
					}
					else{
						findChildren(subContent[a]._id,false,func);
					}
				}
			}
			//if it's the first one called, have it send the response after we've recursed
			if(finisher){
				func();
			}
		});
	}

	//find the video, and save it
	videoModel.findOne({'_id':contentId}, function(err,thisVid){
		videoData.video = thisVid;

		//call the recursive function, starting with the our video as the root
		findChildren(thisVid._id , true, function(){
			res.render('video.html', videoData); //send our data to html once it's done recursing
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
	var temp_parentId = req.path.split('/')[2];

	var tempComment = new commentModel({
		name : req.body.name,
		comment : req.body.content,
		start : req.body.start,
		end : req.body.end,
		parentId : temp_parentId
	});

	tempComment.save(function(err){
		if (err) {
			console.error("Error on saving new comment");
			console.error(err);
			return res.send("There was an error when creating a new comment");

		} else {
			// redirect to the video's page
			res.redirect('/video/'+ temp_parentId);
		}
	});
};

exports.newReply = function(req,res){

	function findParentVid(tempId){
		videoModel.findOne({'_id':tempId}, function(err,parentVid){
			if(parentVid == null){
				commentModel.findOne({'_id':tempId}, function(err,parentComment){
					findParentVid(parentComment.parentId);
				});
			}
			else{
				//redirect to the found movie's page
				res.redirect('/video/'+ parentVid._id);
			}
		});
	}

	var temp_parentId = req.path.split('/')[2];

	commentModel.findOne({'_id':temp_parentId}, function(err,parentComment){
		var tempComment = new commentModel({
			name : req.body.replyName,
			comment : req.body.replyContent,
			start : parentComment.start,
			end : parentComment.end,
			parentId : parentComment._id
		});
		tempComment.save(function(err){
			if (err) {
				console.error("Error on saving new comment");
				console.error(err);
				return res.send("There was an error when creating a new comment");

			} else {
				// redirect to the video's page
				findParentVid(parentComment._id);
			}
		});
	});
};
