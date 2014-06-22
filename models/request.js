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

RequestSchema.path('type').validate(function(type) {
    var array = ['connect', 'message', 'group'];
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
    Request.group = obj.group;
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