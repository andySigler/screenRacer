var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define a new schema
var VideoSchema = new Schema({
	'title' : String,
	'url': String,
	'id': String
});

// export the model
module.exports = mongoose.model('Video',VideoSchema);