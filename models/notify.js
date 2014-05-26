var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var NotifySchema = new Schema({
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
    hasRead: {
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

NotifySchema.path('type').validate(function(type) {
    var array = ['connect', 'message'];
    if (array.indexOf(type) >= 0) {
        return true;
    } else {
        return false;
    }
}, 'type should be connect or message');

// statics
NotifySchema.statics.createNew = function(obj, cb) {
    var notify = new this();
    notify.from = obj.from;
    notify.to = obj.to;
    notify.type = obj.type;
    notify.content = obj.content;
    notify.save(cb);
};
NotifySchema.statics.delete = function(id, cb) {
    this.findOne({
        _id: id
    }, function(err, notify) {
        notify.remove(cb);
    });
};

// methods
TrendSchema.methods.read = function(cb) {
    this.hasRead = true;
    this.save(cb);
};

// middleware
NotifySchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Notify', NotifySchema);