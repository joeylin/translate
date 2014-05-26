var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ShareSchema = new Schema({
    user: {
        type: ObjectId
    },
    _type: {
        type: String
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
    share._type = obj._type;
    share.user = obj.userId;
    share.save(function(err, share) {
        var Trend = mongoose.model('Trend');
        Trend.createNew({
            id: share._id,
            name: 'Share',
            userId: share.user,
            _type: share._type
        }, function(err) {
            cb(err, share);
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
ShareSchema.methods.getUser = function(cb) {
    if (this._type === 'User') {
        var User = mongoose.model('User');
        User.findOne({
            _id: this.user
        }, function(err, user) {
            cb(err, user);
        });
    }
    if (this._type === 'Company') {
        var Company = mongoose.model('Company');
        Company.findOne({
            _id: this.user
        }, function(err, company) {
            cb(err, company);
        });
    }
};

// middleware
ShareSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Share', ShareSchema);