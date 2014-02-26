var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TagSchema = new Schema({
    _id: {
        type: ObjectId
    },
    tag_name: {
        type: String
    },
    create_at: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Tag', TagSchema);