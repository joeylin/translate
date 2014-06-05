var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

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

RequestSchema.path('type').validate(function(type) {
    var array = ['connect', 'message'];
    if (array.indexOf(type) >= 0) {
        return true;
    } else {
        return false;
    }
}, 'type should be connect or message');

// statics
RequestSchema.statics.createNew = function(obj, cb) {
    var Request = new this();
    Request.from = obj.from;
    Request.to = obj.to;
    Request.type = obj.type;
    Request.content = obj.content;
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
RequestSchema.methods.dispose = function(value, userId, cb) {
    var User = mongoose.model('User');
    var id = this._id;
    console.log(id);

    this.hasDisposed = true;
    this.isPass = value;
    this.save(function(err) {
        User.findOne({
            _id: userId
        }, function(err, user) {
            console.log(user);
            var index = user.request.indexOf(id);
            user.requests.splice(index, 1);

            // ensure multi-requests form one person to be disposed at the same time
            var async = require('async');
            async.eachSeries(user.requests, function(request, next) {
                if (request.from === userId) {
                    var Request = mongoose.model('Request');
                    Request.findOne({
                        _id: request._id
                    }, function(err, request) {
                        request.hasDisposed = true;
                        request.isPass = true;
                        request.save(function(err) {
                            next();
                        });
                    });
                } else {
                    next();
                }
            }, function(err) {
                cb(err);
            });
            user.save(function(err, user) {
                cb(err, user);
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