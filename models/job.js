var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var JobSchema = new Schema({
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
    likes: [{
        type: ObjectId,
        ref: 'User'
    }],
    resumes: [{
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
    createAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    }
});

JobSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});
JobSchema.virtual('collectCount').get(function() {
    return this.collects.length;
});
JobSchema.virtual('resumeCount').get(function() {
    return this.collects.length;
});


// statics
JobSchema.statics.createNew = function(obj, cb) {
    var job = new this();
    for (var key in obj) {
        job[key] = obj[key];
    }
    var IdGenerator = mongoose.model('IdGenerator');
    IdGenerator.getNewId('job', function(err, doc) {
        job.id = doc.currentId;
        job.save(function(err, job) {
            var Trend = mongoose.model('Trend');
            Trend.createNew({
                job: job._id,
                name: 'Job',
                userId: job.user
            }, function(err) {
                cb(err, job);
            });
        });
    });
};
JobSchema.statics.delete = function(id, cb) {
    this.findOne({
        _id: id
    }, function(err, job) {
        var Trend = mongoose.model('Trend');
        Trend.findOne({
            id: job._id
        }, function(err, trend) {
            trend.remove();
            job.is_delete = true;
            job.save(cb);
        });
    });
};

// methods
JobSchema.methods.like = function(userId) {
    this.likes.push(userId);
    this.save();
};
JobSchema.methods.unLike = function(userId) {
    this.likes.splice(this.likes.indexOf(userId), 1);
    this.save();
};
JobSchema.methods.collect = function(userId) {
    this.collects.push(userId);
    this.save();
};
JobSchema.methods.unCollect = function(userId) {
    this.collects.splice(this.collects.indexOf(userId), 1);
    this.save();
};
JobSchema.methods.pushResume = function(userId) {
    this.resumes.push(userId);
    this.save();
};
JobSchema.methods.addComment = function(obj, cb) {
    var Comment = mongoose.Model('Comment');
    var job = this;
    Comment.createNew(obj, function(err, comment) {
        job.comments.push(comment._id);
        job.save(function(err, _share) {
            cb(err, _share);
        });
    });
};
JobSchema.methods.deleteComment = function(comment, cb) {
    var index = this.comments.indexOf(comment);
    this.comments.splice(index, 1);
    this.save(function(err, job) {
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
JobSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Job', JobSchema);