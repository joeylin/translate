var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TopicSchema = new Schema({
    _id: {
        type: ObjectId
    },
    title: {
        type: String
    },
    user_id: {
        type: String
    },
    tag: {
        type: String
    },
    collect: {
        type: String
    },
    create_at: {
        type: Date,
        default: Date.now
    },
    update_at: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Topic', TopicSchema);