var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ParagraphSchema = new Schema({
    content: {
        type: String
    },
    topic: {
        type: String
    },
    type: {
        type: String
    },
    count: {
        type: Number,
        default: 0
    },
    hash: {
        type: Number
    }
});

mongoose.model('Paragraph', ParagraphSchema);