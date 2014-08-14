var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserProfileSchema = new Schema({
    name: {
        type: String,
        default: 'user'
    },
    user: {
        type: ObjectId,
        ref: 'User',
        unique: true
    },
    birth: Date,
    height: String,
    weight: String,
    hometown: String,
    location: [{
        type: String
    }],
    desc: String,
    language: [{
        name: {
            type: String
        },
        rate: String
    }],
    edu: [{
        startYear: String,
        startMonth: String,
        endYear: String,
        endMonth: String,
        degree: String,
        field: String,
        school: String,
        desc: String
    }],
    experience: [{
        startYear: String,
        startMonth: String,
        endYear: String,
        endMonth: String,
        company: String,
        title: String,
        isCurrentJob: Boolean,
        location: String,
        desc: String
    }],
    works: [{
        url: String,
        desc: String
    }],
    social: [{
        name: String,
        id: String
    }],
    view: {
        type: Number,
        default: 0
    },
    lastView: {
        date: {
            type: Date,
            default: Date.now
        },
        count: {
            type: Number,
            default: 0
        }
    },
    skinIndex: {
        type: Number,
        default: 0
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
UserProfileSchema.statics.getWeekVisit = function(id, cb) {
    this.findOne({
        _id: id
    }).exec(function(err, profile) {
        if (Date.now() - profile.lastView.date.getTime() >= 14 * 24 * 3600) {
            profile.lastView.count = profile.view - profile.lastView.count;
            profile.lastView.date = Date.now();
            profile.save(function(err) {
                cb(err, profile.lastView.count)
            });
        } else {
            cb(err, profile.view - profile.lastView.count);
        }
    })
};
UserProfileSchema.statics.createNew = function(obj, cb) {
    var userProfile = new this();
    for (var key in obj) {
        userProfile[key] = obj[key];
    }
    userProfile.save(cb);
};

// middleware
UserProfileSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

UserProfileSchema.methods.getWeekVisit = function(cb) {
    if (Date.now() - this.lastView.date.getTime() >= 14 * 24 * 3600) {
        var count = this.view - this.lastView.count;
        this.lastView.count = count;
        this.lastView.date = Date.now();
        this.save(function(err, profile) {
            cb(err, count);
        });
    } else {
        cb(null,this.view - this.lastView.count);
    }
};

mongoose.model('UserProfile', UserProfileSchema);