var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var MessageSchema = new Schema({
    from: {
        type: ObjectId,
        ref: 'User'
    },
    to: {
        type: ObjectId,
        ref: 'User'
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

// statics
MessageSchema.statics.createNew = function(obj, cb) {
    var message = new this();
    message.from = obj.from;
    message.to = obj.to;
    message.content = obj.content;
    message.save(cb);
};
MessageSchema.statics.delete = function(id, cb) {
    this.findOne({
        _id: id
    }, function(err, message) {
        message.remove(cb);
    });
};

// methods
TrendSchema.methods.read = function(cb) {
    this.hasRead = true;
    this.save(cb);
};

// middleware
MessageSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Message', MessageSchema);