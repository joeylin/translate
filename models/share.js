var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ShareSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User'
    },
    content: {
        type: String
    },
    at: [{
        type: ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: ObjectId,
        ref: 'Comment'
    }],
    createAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    }
});

ShareSchema.path('content').validate(function(value) {
    if (!value) {
        return false;
    } else {
        return true;
    }
}, 'content is blank');
// statics
ShareSchema.statics.createNew = function(obj, cb) {
    var share = new this();
    share.content = obj.content;
    share.index = obj.index;
    share.chapter = obj.chapter;
    if (obj.translate) {
        share.translates.push(obj.translate);
    }
    share.save(cb);
};

// middleware
ShareSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Share', ShareSchema);