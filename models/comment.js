var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var moment = require('moment');

var CommentSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User'
    },
    shareId: {
        type: ObjectId,
        ref: 'Share'
    },
    content: {
        type: String
    },
    replyTo: {
        type: ObjectId,
        ref: 'User'
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
CommentSchema.virtual('date').get(function() {
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
CommentSchema.path('content').validate(function(value) {
    if (!value) {
        return false;
    } else {
        return true;
    }
}, 'content is blank');
// statics
CommentSchema.statics.createNew = function(obj, cb) {
    var comment = new this();
    comment.content = obj.content;
    comment.user = obj.user;
    comment.replyTo = obj.replyTo;
    comment.shareId = obj.shareId;
    comment.save(cb);
    sendRequest(comment);
};

// middleware
CommentSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Comment', CommentSchema);

function sendRequest(comment) {
    var Request = mongoose.model('Request');
    var User = mongoose.model('User');
    var atStr = comment.content.match(/\B@\w*\b/g);
    var atList = atStr ? atStr.split(',') : [];
    var atArray  = [];
    atList.map(function(value,key) {
        atArray.push(value.replace('@',''));
    });
    var query = {
        name: {
            $in: atArray
        }
    };
    User.find(query).exec(function(err, users) {
        if (err || !users) {
            return false;
        }
        var atAuthor = false;
        users.map(function(user, key) {
            var obj = {};
            obj.to = user._id;
            obj.shareId = comment.shareId;
            obj.from = comment.user;
            if (user._id.toString() == comment.replyTo) {
                obj.type = 'comment';
                atAuthor = true;
            } else {
                obj.type = 'at';
            }
            Request.createNew(obj);
        });
        if (!atAuthor) {
            var req = {};
            req.to = comment.replyTo;
            req.from = comment.user;
            req.shareId = comment.shareId;
            req.type = 'comment';
            Request.createNew(req);
        }
    });
}