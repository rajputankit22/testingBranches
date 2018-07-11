var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var notificationSchema = new Schema({
	timestamp:{
		type:Date,
		default: Date.now,
	},
	title:{
		type:String
	},
	notification:{
		type:String
	},
});

module.exports = mongoose.model('globalnotifications', notificationSchema);
