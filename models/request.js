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
RequestSchema.methods.dispose = function(value, cb) {
    this.hasDisposed = true;
    this.isPass = value;
    this.save(cb);
};

// middleware
RequestSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Request', RequestSchema);