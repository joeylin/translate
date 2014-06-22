var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var GroupCount = new Schema({
    group: {
        type: ObjectId,
        ref: 'Group'
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

GroupCount.virtual('likeCount').get(function() {
    return this.likes.length;
});
GroupCount.virtual('collectCount').get(function() {
    return this.collects.length;
});
GroupCount.virtual('resumeCount').get(function() {
    return this.collects.length;
});


// statics
GroupCount.statics.createNew = function(obj, cb) {
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
GroupCount.statics.delete = function(id, cb) {
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
GroupCount.methods.deleteComment = function(comment, cb) {
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
GroupCount.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Job', GroupCount);