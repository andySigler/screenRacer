var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define a new schema
var CommentSchema = new Schema({
	'name' : String,
	'comment' : String,

	'start' : String,
	'end': String,

	'parentId': String
});

// export the model
module.exports = mongoose.model('Content',CommentSchema);