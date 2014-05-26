var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CommentSchema = new Schema({
    user: {
        type: ObjectId
    },
    _type: {
        type: String
    },
    content: {
        type: String
    },
    replyTo: {
        _type: {
            type: String
        },
        id: {
            type: ObjectId
        }
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

CommentSchema.path('content').validate(function(value) {
    if (!value) {
        return false;
    } else {
        return true;
    }
}, 'content is blank');
// statics
CommentSchema.statics.createNew = function(obj, cb) {
    var conment = new this();
    conment.content = obj.content;
    conment.user = obj.user;
    comment._type = obj._type;
    conment.replyTo = obj.replyTo;
    conment.save(cb);
};

CommentSchema.methods.getUser = function(cb) {
    if (this._type === 'user') {
        var User = mongoose.model('User');
        User.findOne({
            _id: this.user
        }, function(err, user) {
            cb(err, user);
        });
    }
    if (this._type === 'company') {
        var Company = mongoose.model('Company');
        Company.findOne({
            _id: this.user
        }, function(err, company) {
            cb(err, company);
        });
    }
};

// middleware
CommentSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Comment', CommentSchema);