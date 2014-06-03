var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TrendSchema = new Schema({
    share: {
        type: ObjectId,
        ref: 'Share'
    },
    job: {
        type: ObjectId,
        ref: 'Job'
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
TrendSchema.methods.getContent = function(cb) {
    if (this.name === 'Share') {
        var Share = mongoose.Model('Share');
        Share.findOne({
            _id: this.share
        }, function(err, share) {
            cb(err, share);
        });
    }
    if (this.name === 'Job') {
        var Job = mongoose.Model('Job');
        Job.findOne({
            _id: this.job
        }, function(err, job) {
            cb(err, job);
        });
    }
};
TrendSchema.methods.addComment = function(obj, cb) {
    if (this.name === 'Share') {
        var Share = mongoose.Model('Share');
        Share.findOne({
            _id: this.share
        }, function(err, share) {
            share.addComment(obj, cb);
        });
    }
    if (this.name === 'Job') {
        var Job = mongoose.Model('Job');
        Job.findOne({
            _id: this.job
        }, function(err, job) {
            job.addComment(obj, cb);
        });
    }
};

// middleware
TrendSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Trend', TrendSchema);