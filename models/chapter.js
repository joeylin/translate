var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ChapterSchema = new Schema({
    name: {
        type: String
    },
    doc: {
        type: ObjectId,
        ref: 'Doc'
    },
    index: {
        type: Number,
        default: 0
    },
    sections: [{
        type: ObjectId,
        ref: 'Section'
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

mongoose.model('Chapter', ChapterSchema);