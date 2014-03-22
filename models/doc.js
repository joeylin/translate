var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var DocSchema = new Schema({
    tags: [{
        type: ObjectId,
        ref: 'Tag'
    }],
    chapters: [{
        type: ObjectId,
        ref: 'Chapter'
    }],
    create_at: {
        type: Date,
        default: Date.now
    },
    update_at: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        unique: true
    },
    des: {
        type: String
    },
});

mongoose.model('Doc', DocSchema);