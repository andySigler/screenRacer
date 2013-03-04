var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define a new schema
var CommentSchema = new Schema({
	name : String,
	content : String,
	start : String,
	end: String,
	id: String,
	realId: String
});

// export the model
module.exports = mongoose.model('Content',CommentSchema);