var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var crypto = require('crypto');
var oAuthTypes = ['github', 'twitter', 'facebook', 'google', 'linkedin'];

var UserSchema = new Schema({
    real_name: {
        type: String,
        default: 'real name'
    },
    birth: {
        type: Date
    },
    sex: {
        type: String
    },
    school: {
        type: String
    },
    schoolStart: {
        type: Number
    },
    schoolEnd: {
        type: Number
    },
    isStudent: {
        type: Boolean
    },
    isFreelance: {
        type: Boolean
    },
    company: {
        type: String
    },
    occupation: {
        type: String
    },
    skills: [{
        name: String,
        vote: [{
            user: {
                type: ObjectId,
                ref: 'User'
            },
            rate: Number
        }]
    }],
    name: {
        type: String
    },
    phone: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    degree: {
        type: String
    },
    workYear: {
        type: Number,
        default: 0
    },
    current: {
        location: {
            type: String
        },
        status: {
            type: String
        }
    },
    id: {
        type: Number
    },
    avatar: {
        type: String,
        default: '/public/imgs/avatar.jpg'
    },
    signature: {
        type: String
    },
    role: {
        type: String
    },
    profile: {
        type: ObjectId
    },
    followers: [{
        type: ObjectId,
        ref: 'User'
    }],
    followerings: [{
        type: ObjectId,
        ref: 'User'
    }],
    connects: [{
        user: {
            type: ObjectId,
            ref: 'User'
        },
        relate: {
            type: String
        }
    }],
    groups: {
        pending: [{
            type: ObjectId,
            ref: 'Group'
        }],
        join: [{
            type: ObjectId,
            ref: 'Group'
        }],
        follow: [{
            type: ObjectId,
            ref: 'Group'
        }],
        create: [{
            type: ObjectId,
            ref: 'Group'
        }]
    },
    visit: {
        home: Date,
        groupTrends: Date
    }, 

    // company 
    phase: String,
    industry: String,
    scale: String,
    location: String,
    page: String,
    members: [{
        type: ObjectId,
        ref: 'User',
    }],
    jobs: [{
        type: ObjectId,
        ref: 'Job'
    }],

    // common
    likes: [{
        type: ObjectId,
        ref: 'User'
    }],
    share: [{
        type: ObjectId,
        ref: 'Share'
    }],
    provider: {
        type: String,
        default: ''
    },
    hashedPassword: {
        type: String,
        default: '',
    },
    salt: {
        type: String,
        default: 'ts'
    },
    authToken: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: false
    },
    emailActiveCode: {
        count: {
            type: Number,
            default: 0
        },
        code: String,
        date: Date
    },
    isFinishProfile: {
        type: Boolean,
        default: false
    },
    registerStage: {
        type: Number,
        default: 1
    },

    facebook: {},
    twitter: {},
    github: {},
    google: {},
    linkedin: {},
    createAt: {
        type: Date,
        default: Date.now
    }
});

// UserSchema.virtual('avatar_url').get(function() {
//     var url = this.profile_image_url || this.avatar || config.site_static_host + '/public/images/user_icon&48.png';
//     return url.replace('http://www.gravatar.com/', 'http://cnodegravatar.u.qiniudn.com/');
// });
UserSchema.virtual('password').set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
}).get(function() {
    return this._password;
});
UserSchema.virtual('connectList').get(function() {
    var result = [];
    this.connects.map(function(value, key) {
        result.push(value.user);
    });
    return result;
});
UserSchema.virtual('activeCode').set(function(code) {
    this.emailActiveCode.code = code;
    this.emailActiveCode.date = new Date();
});

/**
 * Validations
 */

var validatePresenceOf = function(value) {
    return value && value.length;
};
UserSchema.path('email').validate(function(email) {
    if (this.doesNotRequireValidation()) {
        return true;
    }
    return email.length;
}, 'Email cannot be blank');

UserSchema.path('email').validate(function(email, fn) {
    var User = mongoose.model('User');
    if (this.doesNotRequireValidation()) {
        fn(true);
    }
    // Check only when it is a new user or when email field is modified
    if (this.isNew || this.isModified('email')) {
        User.find({
            email: email
        }).exec(function(err, users) {
            fn(!err && users.length === 0);
        });
    } else {
        fn(true);
    }
}, 'Email already exists');

UserSchema.path('name').validate(function(name) {
    if (this.doesNotRequireValidation()) {
        return true;
    }
    return name.length;
}, 'name cannot be blank');

UserSchema.path('hashedPassword').validate(function(hashedPassword) {
    if (this.doesNotRequireValidation()) {
        return true;
    }
    return hashedPassword.length;
}, 'Password cannot be blank');


/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
    if (!this.isNew) {
        return next();
    }
    if (!validatePresenceOf(this.password) && !this.doesNotRequireValidation()) {
        next(new Error('Invalid password'));
    } else {
        next();
    }
});

/**
 * Statics
 */
UserSchema.statics.getProfile = function(id, cb) {
    this.findOne({
        id: id
    }).populate('connects').exec(function(err, user) {
        if (user.role === 'user') {
            var UserProfile = mongoose.model('UserProfile');
            UserProfile.findOne({
                _id: user.profile
            }, function(err, profile) {
                cb(err, profile, user);
            });
        }
        if (user.role === 'company') {
            var CompanyProfile = mongoose.model('CompanyProfile');
            CompanyProfile.findOne({
                _id: user.profile
            }, function(err, profile) {
                cb(err, profile, user);
            });
        }
    });
};
UserSchema.statics.joinGroup = function(id, groupId, cb) {
    this.findOne({
        _id: id
    }, function(err, user) {
        if (!user) {
            cb(null, null);
        }
        user.groups.join.push(groupId);
        user.groups.follow.push(groupId);
        user.save(cb);
    });
};
UserSchema.statics.quitGroup = function(id, groupId, cb) {
    this.findOne({
        _id: id
    }, function(err, user) {
        if (!user) {
            cb(null, null);
        }
        var index = -1;
        user.groups.join.map(function(item, key) {
            if (item.toString() == groupId) {
                index = key;
            }
        });
        user.groups.join.splice(index, 1);
        user.save(cb);
    });
};

/**
 * Methods
 */

UserSchema.methods = {

    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */

    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashedPassword;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */

    makeSalt: function() {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */

    encryptPassword: function(password) {
        if (!password) {
            return '';
        }
        var encrypred;
        try {
            encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex');
            return encrypred;
        } catch (err) {
            return '';
        }
    },

    /**
     * Validation is not required if using OAuth
     */

    doesNotRequireValidation: function() {
        return~ oAuthTypes.indexOf(this.provider);
    },

    // user
    checkConnected: function(userId) {
        var result = false;
        this.connects.map(function(connect, key) {
            if (connect.user.toString() === userId.toString()) {
                result = true;
                return false;
            }
        });
        return result;
    },
    connect: function(userId, relate, cb) {
        var User = mongoose.model('User');
        if (this.checkConnected(userId)) {
            return cb({
                message: 'hasConnected'
            });
        }
        this.connects.push({
            user: userId,
            relate: relate
        });
        var id = this._id;
        this.save(function(err, user) {
            User.findOne({
                _id: userId
            }, function(err, user) {
                if (err) {
                    console.log(err);
                }
                user.connects.push({
                    user: id,
                    relate: relate
                });
                user.save(function(err, user) {
                    if (err) {
                        console.log(err);
                    }
                    cb(err, user);
                });
            });
        });
    },
    disconnect: function(userId, cb) {
        var User = mongoose.model('User');
        var index = -1;
        var connects = this.connects;
        connects.map(function(connect, key) {
            if (connect.user.toString() === userId) {
                connects.splice(key, 1);
                index = key;
            }
        });
        if (index < 0) {
            return cb(null, null);
        }
        var id = this._id;
        this.save(function(err, user) {
            User.findOne({
                _id: userId
            }, function(err, user) {
                user.connects.map(function(connect, key) {
                    if (connect.user.toString() == id.toString()) {
                        user.connects.splice(key, 1);
                    }
                });
                user.save(cb);
            });
        });
    },

    // company
    isLike: function(id) {
        var likes = this.likes;
        var result = false;
        likes.map(function(like) {
            if (like.toString() == id) {
                result = true;
            }
        });
        return result;
    },
    isFollow: function(id) {
        var followers = this.followers;
        var result = false;
        followers.map(function(follower) {
            if (follower.toString() == id) {
                result = true;
            }
        });
        return result;
    }
};

mongoose.model('User', UserSchema);