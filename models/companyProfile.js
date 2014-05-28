var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CompanyProfileSchema = new Schema({
    desc: {
        type: String
    },
    name: {
        type: String,
        default: 'company'
    },
    user: {
        type: ObjectId,
        ref: 'User',
        unique: true
    },
    industry: [{
        type: String
    }],
    experience: [{
        type: String
    }],
    product: {
        item: [{
            type: String
        }],
        isShow: {
            type: Boolean,
            default: false
        }
    },
    builtDate: {
        type: Date
    },
    location: {
        type: String
    },
    members: [{
        type: ObjectId,
        ref: 'User',
    }],
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
CompanyProfileSchema.statics.createNew = function(obj, cb) {
    var userProfile = new this();
    for (var key in obj) {
        userProfile[key] = obj[key];
    }
    userProfile.save(cb);
};

// middleware
CompanyProfileSchema.pre('save', function(next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('CompanyProfile', CompanyProfileSchema);