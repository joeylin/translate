var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ShareSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User'
    },
    type: {
        type: String
    },
    position: {
        type: String
    },
    department: {
        type: String
    },
    paymentStart: {
        type: String
    },
    paymentEnd: {
        type: String
    },
    workYears: {
        type: String
    },
    degree: {
        type: String
    },
    location: {
        type: String
    },
    summary: {
        type: String
    },
    detail: {
        type: String
    },  
    resumes: [{
        type: ObjectId,
        ref: 'User'
    }],
    // common
    likes: [{
        type: ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: ObjectId,
        ref: 'Comment'
    }],
    is_delete: {
        type: Boolean,
        default: false
    },
    id: {
        type: Number
    },
    content: {
        type: String
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

ShareSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});
ShareSchema.path('type').validate(function(type) {
    var array = ['job','view','post'];
    if (array.indexOf(type) >= 0) {
        return true;
    } else {
        return false;
    }
}, 'type should be one of job, view and post');
// statics
ShareSchema.statics.createNew = function(obj, cb) {
    var share = new this();
    share.content = obj.content;
    share.user = obj.userId;
    share.type = obj.type;
    share.position = obj.position;
    share.department = obj.department;
    share.paymentStart = obj.paymentStart;
    share.paymentEnd = obj.paymentEnd;
    share.degree = obj.degree;
    share.workYears = obj.workYears;
    share.location = obj.location;
    share.summary = obj.summary;
    share.detail = obj.detail;
    var IdGenerator = mongoose.model('IdGenerator');
    IdGenerator.getNewId('share', function(err, doc) {
        share.id = doc.currentId;
        share.save(cb);
    });
};
ShareSchema.statics.delete = function(id, cb) {
    this.findOne({
        _id: id
    }, function(err, share) {
        share.is_delete = true;
        share.save(cb);
    });
};

// methods
ShareSchema.methods.like = function(userId, cb) {
    this.likes.push(userId);
    this.save(cb);
};
ShareSchema.methods.unlike = function(userId, cb) {
    this.likes.splice(this.likes.indexOf(userId), 1);
    this.save(cb);
};
ShareSchema.methods.addComment = function(obj, cb) {
    var Comment = mongoose.Model('Comment');
    var share = this;
    Comment.createNew(obj, function(err, comment) {
        share.comments.push(comment._id);
        share.save(cb);
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
            comment.is_delete = true;
            comment.save(cb);
        });
    });
};

// middleware
ShareSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Share', ShareSchema);