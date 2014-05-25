var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var crypto = require('crypto');
var oAuthTypes = ['github', 'twitter', 'facebook', 'google', 'linkedin'];
var async = require('async');

var CompanySchema = new Schema({
    display_name: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    desc: {
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
    trends: [{
        name: {
            type: String
        },
        id: {
            type: ObjectId
        }
    }],
    name: {
        type: String,
        unique: true
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
    social: [{
        name: {
            type: String
        },
        value: {
            type: Number
        }
    }],
    createAt: {
        type: Date,
        default: Date.now
    }
});

// CompanySchema.virtual('avatar_url').get(function() {
//     var url = this.profile_image_url || this.avatar || config.site_static_host + '/public/images/user_icon&48.png';
//     return url.replace('http://www.gravatar.com/', 'http://cnodegravatar.u.qiniudn.com/');
// });
CompanySchema.virtual('password').set(function(password) {
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
CompanySchema.path('email').validate(function(email) {
    if (this.doesNotRequireValidation()) {
        return true;
    }
    return email.length;
}, 'Email cannot be blank');
CompanySchema.path('email').validate(function(email, fn) {
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
CompanySchema.path('username').validate(function(username) {
    if (this.doesNotRequireValidation()) {
        return true;
    }
    return username.length;
}, 'Username cannot be blank');
CompanySchema.path('hashedPassword').validate(function(hashedPassword) {
    if (this.doesNotRequireValidation()) {
        return true;
    }
    return hashedPassword.length;
}, 'Password cannot be blank');


/**
 * Pre-save hook
 */

CompanySchema.pre('save', function(next) {
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

CompanySchema.methods = {

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

    getTrends: function(cb) {
        var trends = [];
        async.eachSeries(this.trends, function(trend, next) {
            if (trend.name === 'job') {
                Job.findOne({
                    _id: trend.id
                }, function(err, job) {
                    var result = {};
                    result.name = 'job';
                    result.job = job;
                    trends.push(result);
                    next();
                });
            } else if (trend.name === 'share') {
                Share.findOne({
                    _id: trend.id
                }, function(err, share) {
                    var result = {};
                    result.name = 'share';
                    result.share = share;
                    trends.push(result);
                    next();
                });
            }
        }, function(err) {
            cb(err, trends);
        });
    }
};

mongoose.model('Company', CompanySchema);