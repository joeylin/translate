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
    likes: [{
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

ShareSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

// statics
ShareSchema.statics.createNew = function(obj, cb) {
    var share = new this();
    share.content = obj.content;
    share.user = obj.userId;
    share.save(cb);
};

// methods
ShareSchema.methods.like = function(userId) {
    this.likes.push(userId);
    this.save();
};
ShareSchema.methods.unlike = function(userId) {
    this.likes.splice(this.likes.indexOf(userId),1);
    this.save();
};

// middleware
ShareSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Share', ShareSchema);