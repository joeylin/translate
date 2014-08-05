var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var FeedbackSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    content: {
        type: String
    },
    is_reply: {
        type: Boolean,
        default: false
    },
    reply: {
        type: String
    },
    is_delete: {
        type: Boolean,
        default: false
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    }
});

// statics
FeedbackSchema.statics.createNew = function(obj, cb) {
    var feedback = new this();
    feedback.name = obj.name;
    feedback.email = obj.email;
    feedback.content = obj.content;
    feedback.save(cb);
};

// middleware
FeedbackSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Feedback', FeedbackSchema);