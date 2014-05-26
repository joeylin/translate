var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TrendSchema = new Schema({
    id: {
        type: ObjectId
    },
    name: {
        type: String
    },
    userId: {
        type: ObjectId,
        ref: 'User'
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

TrendSchema.path('name').validate(function(name) {
    var array = ['Job', 'Share'];
    if (array.indexOf(name) >= 0) {
        return true;
    } else {
        return false;
    }
}, 'name should be job or share');

// statics
TrendSchema.statics.createNew = function(obj, cb) {
    var trend = new this();
    trend.id = obj.id;
    trend.name = obj.name;
    trend.save(cb);
};
TrendSchema.statics.delete = function(id, cb) {
    this.findOne({
        _id: id
    }, function(err, trend) {
        trend.remove(cb);
    });
};

// methods
TrendSchema.methods.getTrend = function(cb) {
    var Model = mongoose.model(this.name);
    Model.findOne({
        _id: this.id
    }, function(err, model) {
        cb(err, model);
    });
};

// middleware
TrendSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Trend', TrendSchema);