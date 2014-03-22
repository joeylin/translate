var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TranslateSchema = new Schema({
    content: {
        type: String
    },
    author: {
        type: ObjectId,
        ref: 'User'
    },
    star: {
        type: Number,
        default: 0
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