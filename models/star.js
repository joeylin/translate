var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Star = new Schema({
    _id: {
        type: ObjectId
    },
    timestamp: {
        type: Number
    },
    user_id: {
        type: String
    }
});

mongoose.model('Star', Star);