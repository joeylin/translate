var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TranslateSchema = new Schema({
    _id: {
        type: ObjectId
    },
    content: {
        type: String
    },
    user_id: {
        type: String
    },
    hash: {
        type: Number
    },
    vote: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Number
    },
    create_at: {
        type: Date,
        default: Date.now
    },
    update_at: {
        type: Date,
        default: Date.now
    },
    content_is_html: {
        type: Boolean
    }
});

mongoose.model('Translate', TranslateSchema);