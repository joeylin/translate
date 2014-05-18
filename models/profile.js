var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ProfileSchema = new Schema({
    chapter: {
        type: ObjectId,
        ref: 'Chapter'
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
    content: {
        type: String
    },
    dataType: {
        type: String
    },
    index: {
        type: Number,
        default: 0
    },
    isFinished: {
        value: {
            type: Boolean,
            default: false
        },
        user: {
            type: ObjectId,
            ref: 'User'
        },
        date: {
            type: Date
        }
    },
    isTranslated: {
        type: Boolean,
        default: false
    },
    translates: [{
        type: ObjectId,
        ref: 'Translate'
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

ProfileSchema.virtual('html').get(function() {
    var marked = require('marked');
    return marked(this.content);
});
ProfileSchema.path('isFinished.value').validate(function(value) {
    if (!this.translates.length && value) {
        return false;
    }
    return true;
}, 'translate is blank');
// statics
ProfileSchema.statics.createNew = function(obj, cb) {
    var section = new this();
    section.content = obj.content;
    section.index = obj.index;
    section.chapter = obj.chapter;
    if (obj.translate) {
        section.translates.push(obj.translate);
    }
    section.save(cb);
};

// methods
ProfileSchema.methods.setFinished = function(userId) {
    this.isFinished.value = true;
    this.isFinished.user = userId;
    this.date = new Date();
    this.save();
};
ProfileSchema.methods.unsetFinished = function() {
    this.isFinished.value = false;
    this.isFinished.user = '';
    this.date = new Date();
    this.save();
};

// middleware
ProfileSchema.pre('save', function(next) {
    if (this.translates.length > 0) {
        this.isTranslated = true;
    }
    this.updateAt = new Date();
    next();
});

mongoose.model('Section', ProfileSchema);