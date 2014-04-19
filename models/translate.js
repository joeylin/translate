var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TranslateSchema = new Schema({
    // markdown format
    content: {
        type: String
    },
    author: {
        type: String,
        ref: 'User'
    },
    origin: {
        type: ObjectId,
        ref: 'Section'
    },
    starUser: [{
        type: String,
        ref: 'User'
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

TranslateSchema.virtual('getStarNumber').get(function() {
    return this.starUser.length;
});

// methods
TranslateSchema.methods.star = function(userId,cb) {
    var index = this.starUser.indexOf(userId);
    if (index === -1) {
        this.starUser.push(userId);
    }
    this.save(cb);
};
TranslateSchema.methods.unstar = function(userId,cb) {
    var index = this.starUser.indexOf(userId);
    if (index > -1) {
        this.starUser.splice(index, 1);
    }
    this.save(cb);
};
TranslateSchema.methods.userIsStared = function(userId) {
    var index = this.starUser.indexOf(userId);
    if (index === -1) {
        return false;
    } else {
        return true;
    }
};

// statics
TranslateSchema.statics.createNew = function(obj, cb) {
    var translate = new this();
    translate.content = obj.content;
    translate.origin = obj.origin;
    translate.author = obj.author;
    translate.save(cb);
};

// middleware
TranslateSchema.pre('save', function (next) {
  this.updateAt = new Date();
  next();
});

mongoose.model('Translate', TranslateSchema);