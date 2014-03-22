var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var SectionSchema = new Schema({
    name: {
        type: String
    },
    hash: {
        type: String
    },
    chapter: {
        type: String,
        ref: 'Chapter'
    },
    md: {
        type: String
    },
    index: {
        type: Number,
        default: 0
    },
    html: {
        type: String
    },
    translates: [{
        type: ObjectId,
        ref: 'Translate'
    }],
    create_at: {
        type: Date,
        default: Date.now
    },
    update_at: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Section', SectionSchema);