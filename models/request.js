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
    currentComment: {
        type: ObjectId,
        ref: 'Comment'
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
    title: {
        type: String
    },
    html: {
        type: String
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
    // admin
    role: {
        type: String
    },
    info: Schema.Types.Mixed,

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

// RequestSchema.path('type').validate(function(type) {
//     var array = ['connect', 'message', 'group', 'at', 'comment'];
//     if (array.indexOf(type) >= 0) {
//         return true;
//     } else {
//         return false;
//     }
// }, 'type error');

// statics
RequestSchema.statics.createNew = function(obj, cb) {
    var Request = new this();
    Request.from = obj.from;
    Request.to = obj.to;
    Request.type = obj.type;
    Request.content = obj.content;
    Request.group = obj.group;
    Request.currentComment = obj.currentComment;
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
// to group title ( info 可选)
RequestSchema.statics.notice = function(obj, cb) {
    var Request = new this();
    var User = mongoose.model('User');
    var Group = mongoose.model('Group');
    Request.type = 'notice';
    Request.to = obj.to;
    Request.group = obj.group;
    Request.title = obj.title; 

    if (obj.title == 'connect') {
        User.findOne({
            _id: obj.to
        }).exec(function(err, user) {
            if (err || !user) {
                return false;
            }
            Request.content = user.name +　' 添加你为好友';
            Request.html = '<a href="/profile/' + user.id + '" target="_blank">' + user.name + '</a> 添加你为好友';
            Request.save(cb);
        });
    }
    if (obj.title == 'admin') {
        Group.findOne({
            _id: obj.group
        }).exec(function(err, group) {
            if (err || !group) {
                return false;
            }
            Request.content = '你已经成为 ' + group.name + ' 管理员';
            Request.html = '你已经成为 ' + '<a href="/group/' + group.id + '" target="_blank">' + group.name + '</a>' + ' 管理员';
            Request.save(cb);
        });
    }
    if (obj.title == 'member') {
        Group.findOne({
            _id: obj.group
        }).exec(function(err, group) {
            if (err || !group) {
                return false;
            }
            Request.content = '你已成功加入 ' + group.name;
            Request.html = '你已成功加入 ' +  '<a href="/profile/' + group.id + '" target="_blank">' + group.name + '</a>';
            Request.save(cb);
        });
    }
    if (obj.title == 'system') {
        Request.content = obj.content;
        Request.html = obj.content;
        Request.save(cb);
    }
    if (obj.title == 'apply-pass') {
        Group.findOne({
            _id: obj.group
        }).exec(function(err, group) {
            if (err || !group) {
                return false;
            }
            Request.content = '恭喜, 你创建的圈子 ' + group.name + ' 已经通过审核';
            Request.html = '恭喜, 你创建的圈子 ' + '<a href="/group/' + group.id + '" target="_blank">' + group.name + '</a>' + ' 已经通过审核';
            Request.save(cb);
        });
    } 
    if (obj.title == 'apply-fail') {
        Request.info = obj.info;
        Request.content = '你申请的圈子 ' + obj.info.name + ' 未通过审核';
        Request.html = '你申请的圈子 <span style="color:#3c8dbc;">' + obj.info.name + '</span> 未通过审核' + 
            '<div><span style="font-weight:700;">信息</span> : ' + obj.info.name + ' ' + obj.info.industry + ' ' + ' ' + obj.info.reason + '</div>' +
            '<div><span style="font-weight:700;">原因</span> : ' + obj.info.msg + '</div>';
        Request.markModified('info');
        Request.save(cb);
    }
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