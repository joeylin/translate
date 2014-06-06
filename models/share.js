var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ShareSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User'
    },
    id: {
        type: Number
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
    var IdGenerator = mongoose.model('IdGenerator');
    IdGenerator.getNewId('share', function(err, doc) {
        share.id = doc.currentId;
        share.save(function(err, share) {
            var Trend = mongoose.model('Trend');
            Trend.createNew({
                share: share._id,
                name: 'Share',
                userId: share.user
            }, function(err) {
                cb(err, share);
            });
        });
    });
};
ShareSchema.statics.delete = function(id, cb) {
    this.findOne({
        _id: id
    }, function(err, share) {
        var Trend = mongoose.model('Trend');
        Trend.findOne({
            id: share._id
        }, function(err, trend) {
            trend.remove();
            share.remove(cb);
        });
    });
};

// methods
ShareSchema.methods.like = function(userId) {
    this.likes.push(userId);
    this.save();
};
ShareSchema.methods.unlike = function(userId) {
    this.likes.splice(this.likes.indexOf(userId), 1);
    this.save();
};
ShareSchema.methods.addComment = function(obj, cb) {
    var Comment = mongoose.Model('Comment');
    var share = this;
    Comment.createNew(obj, function(err, comment) {
        share.comments.push(comment._id);
        share.save(function(err, _share) {
            cb(err, _share);
        });
    });
};
ShareSchema.methods.deleteComment = function(comment, cb) {
    var index = this.comments.indexOf(comment);
    this.comments.splice(index, 1);
    this.save(function(err, share) {
        var Comment = mongoose.Model('Comment');
        Comment.findOne({
            _id: comment._id
        }, function(err, comment) {
            comment.remove(function(err) {
                cb(err);
            });
        });
    });
};

// middleware
ShareSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Share', ShareSchema);