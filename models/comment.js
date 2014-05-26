var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CommentSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User'
    },
    content: {
        type: String
    },
    replyTo: {
        type: ObjectId,
        ref: 'User'
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

CommentSchema.path('content').validate(function(value) {
    if (!value) {
        return false;
    } else {
        return true;
    }
}, 'content is blank');
// statics
CommentSchema.statics.createNew = function(obj, cb) {
    var conment = new this();
    conment.content = obj.content;
    conment.user = obj.user;
    conment.replyTo = obj.replyTo;
    conment.save(cb);
};

// middleware
CommentSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Comment', CommentSchema);