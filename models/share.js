var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var moment = require('moment');

var ShareSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User'
    },
    group: {
        type: ObjectId,
        ref: 'Group'
    },
    type: {
        type: String
    },
    status: {
        type: String,
        default: 'draft'
    },
    fork: {
        type: Number,
        default: 0
    },
    from: {
        share: {
            type: ObjectId,
            ref: 'Share'
        },
        user: {
            type: ObjectId,
            ref: 'User'
        },
        group: {
            type: ObjectId,
            ref: 'Group'
        },
        title: {
            type: String
        } 
    },
    isFork: {
        type: Boolean,
        default: false
    },
    jobType: {
        type: String
    },
    position: {
        type: String
    },
    company: {
        type: String
    },
    companyIntro: {
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
    number: {
        type: String
    },
    views: {
        type: Number,
        default: 0
    },
    skills: {
        type: String
    },
    resumes: [{
        user: {
            type: ObjectId,
            ref: 'User'
        },
        isQuit: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date
        }
    }],
    // common
    collects: [{
        user: {
            type: ObjectId,
            ref: 'User'
        },
        date: {
            type: Date
        }
    }],
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
ShareSchema.virtual('date').get(function() {
    moment.lang('zh-cn');
    var date = moment(this.createAt);
    var now = moment();
    if (now.diff(date, 'days') < 9) {
        return date.fromNow();
    }
    if (now.diff(date, 'days') >= 9 && now.diff(date, 'years') === 0) {
        return date.format('M-D HH:mm');
    }
    if (now.diff(date, 'days') >= 9 && now.diff(date, 'years') > 0) {
        return date.format('YYYY-M-D HH:mm');
    }
});
ShareSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});
ShareSchema.path('type').validate(function(type) {
    var array = ['job', 'view', 'post', 'group'];
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
    share.user = obj.user;
    share.type = obj.type;
    share.jobType = obj.jobType;
    share.position = obj.position;
    share.department = obj.department;
    share.paymentStart = obj.paymentStart;
    share.paymentEnd = obj.paymentEnd;
    share.company = obj.company;
    share.companyIntro = obj.companyIntro;
    share.degree = obj.degree;
    share.skills = obj.skills;
    share.workYears = obj.workYears;
    share.location = obj.location;
    share.summary = obj.summary;
    share.detail = obj.detail;
    share.group = obj.group;
    share.status = obj.status;
    share.fork = obj.fork;
    share.isFork = obj.isFork;
    share.from = obj.from;
    var IdGenerator = mongoose.model('IdGenerator');
    IdGenerator.getNewId('share', function(err, doc) {
        share.id = doc.currentId;
        share.save(cb);
    });
};
ShareSchema.statics.delete = function(id, userId, cb) {
    this.findOne({
        _id: id
    }, function(err, share) {
        if (share.user.toString() == userId) {
            share.is_delete = true;
            share.save(cb);
        } else {
            cb({
                info: 'no auth'
            });
        }
    });
};
ShareSchema.statics.addComment = function(shareId, obj, cb) {
    this.findOne({
        _id: shareId
    }, function(err, share) {
        var Comment = mongoose.Model('Comment');
        Comment.createNew(obj, function(err, comment) {
            share.comments.push(comment._id);
            share.save(cb);
        });
    });
};
ShareSchema.statics.fork = function(shareId, cb) {
    this.findOne({
        _id: shareId
    }).exec(function(err, share) {
        share.fork += 1;
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

// middleware
ShareSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Share', ShareSchema);