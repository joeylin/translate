var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var moment = require('moment');

var RequestSchema = new Schema({
    from: {
        type: ObjectId,
        ref: 'User'
    },
    to: {
        type: ObjectId,
        ref: 'User'
    },
    type: {
        type: String
    },
    replyComment: {
        type: ObjectId,
        ref: 'Comment'
    },
    shareId: {
        type: ObjectId,
        ref: 'Share'
    },
    group: {
        type: ObjectId,
        ref: 'Group'
    },
    content: {
        type: String
    },
    hasDisposed: {
        type: Boolean,
        default: false
    },
    isPass: {
        type: Boolean
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

RequestSchema.virtual('date').get(function() {
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
RequestSchema.path('type').validate(function(type) {
    var array = ['connect', 'message', 'group', 'at', 'comment'];
    if (array.indexOf(type) >= 0) {
        return true;
    } else {
        return false;
    }
}, 'type error');

// statics
RequestSchema.statics.createNew = function(obj, cb) {
    var Request = new this();
    Request.from = obj.from;
    Request.to = obj.to;
    Request.type = obj.type;
    Request.content = obj.content;
    Request.group = obj.group;
    Request.replyComment = obj.replyComment;
    Request.shareId = obj.shareId;
    Request.save(cb);
};
RequestSchema.statics.delete = function(id, cb) {
    this.findOne({
        _id: id
    }, function(err, Request) {
        Request.remove(cb);
    });
};

// methods
RequestSchema.methods.dispose = function(value, cb) {
    var User = mongoose.model('User');
    var from = this.from;
    var to = this.to;
    this.hasDisposed = true;
    this.isPass = value;
    this.save(function(err) {
        var Request = mongoose.model('Request');
        Request.find({
            from: from,
            to: to
        }, function(err, requests) {
            var async = require('async');
            async.eachSeries(requests, function(request, next) {
                request.hasDisposed = true;
                request.isPass = value;
                request.save(function(err) {
                    next();
                });
            }, function(err) {
                cb(err);
            });
        });
    });
};

// middleware
RequestSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Request', RequestSchema);