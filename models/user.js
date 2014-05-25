var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var crypto = require('crypto');
var oAuthTypes = ['github', 'twitter', 'facebook', 'google', 'linkedin'];

var UserSchema = new Schema({
    display_name: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    des: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        unique: true
    },
    followers: [{
        type: ObjectId,
        ref: 'User'
    }],
    followerings: [{
        type: ObjectId,
        ref: 'User'
    }],
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
    connects: [{
        type: ObjectId,
        ref: 'User'
    }],
    collects: {
        job: [{
            type: ObjectId,
            ref: 'Job'
        }],
        share: [{
            type: ObjectId,
            ref: 'Share'
        }]
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
    share: [{
        type: ObjectId,
        ref: 'Share'
    }],
    groups: {
        pending: [{
            type: ObjectId
        }],
        join: [{
            type: ObjectId
        }] 
    },
    username: {
        type: String,
        unique: true
    },
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

UserSchema.path('username').validate(function(username) {
    if (this.doesNotRequireValidation()) {
        return true;
    }
    return username.length;
}, 'Username cannot be blank');

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
    }
};

mongoose.model('User', UserSchema);