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
    skills: [{
        type: String
    }],
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

mongoose.model('UserProfile', UserProfileSchema);