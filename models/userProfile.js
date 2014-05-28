var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserProfileSchema = new Schema({
    desc: {
        type: String
    },
    name: {
        type: String,
        default: 'user'
    },
    user: {
        type: ObjectId,
        ref: 'User',
        unique: true
    },
    contact: {
        qq: {
            type: Number
        },
        phone: {
            type: Number
        }
    },
    social: [{
        name: {
            type: String
        },
        value: {
            type: Number
        }
    }],
    school: [{
        type: String
    }],
    skills: [{
        type: String
    }],
    age: {
        type: Date
    },
    height: {
        type: Number
    },
    weight: {
        type: Number
    },
    hometown: {
        type: String
    },
    location: [{
        type: String
    }],
    companys: [{
        type: String
    }],
    language: [{
        name: {
            type: String
        },
        rate: Number
    }],
    current: {
        location: {
            type: String
        },
        status: {
            type: String
        }
    },
    educations: [{
        type: String
    }],
    experience: [{
        type: String
    }],
    projects: {
        item: [{
            type: String
        }],
        isShow: {
            type: Boolean,
            default: false
        }
    },
    works: {
        item: [{
            type: String
        }],
        isShow: {
            type: Boolean,
            default: false
        }
    },
    items: [{
        isShow: {
            type: Boolean,
            default: false
        },
        item: [{
            type: String
        }]
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