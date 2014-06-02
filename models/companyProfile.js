var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CompanyProfileSchema = new Schema({
    name: {
        type: String,
        default: 'company'
    },
    user: {
        type: ObjectId,
        ref: 'User',
        unique: true
    },
    desc: {
        type: String
    },
    industry: [{
        type: String
    }],
    product: [{
        type: String
    }],
    activity: [{
        type:String
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