var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserProfileSchema = new Schema({
    desc: {
        type: String
    },
    user: {
        type: ObjectId,
        ref: 'User',
        unique: true
    },
    skills: [{
        type: String
    }],
    educations: [{
        type: String
    }],
    experience: [{
        type: String
    }],
    projects: [{
        item: {
            type: String
        },
        isShow: {
            type: Boolean
        }
    }],
    works: [{
        item: {
            type: String
        },
        isShow: {
            type: Boolean
        }
    }],
    items: [[{
        item: {
            type: String
        },
        isShow: {
            type: Boolean
        }
    }]],
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