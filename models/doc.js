var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var DocSchema = new Schema({
    tags: [{
        type: ObjectId,
        ref: 'Tag'
    }],
    count: [{
        user: {
            type: String
        },
        num: {
            type: Number
        }
    }],
    chapters: [{
        type: ObjectId,
        ref: 'Chapter'
    }],
    createAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        unique: true
    },
    des: {
        type: String
    },
});

DocSchema.virtual('full').get(function() {
    var full = [];
    this.chapters.map(function(value,key) {
        full.push(value.name);
    });
    return full;
});

// methods
DocSchema.methods.pushTag = function(tags,cb) {
    this.tags.push(tags);
    this.save(cb);
};
DocSchema.methods.pushChapter = function(chapters, cb) {
    this.chapters.push(chapters);
    this.save(cb);
};
DocSchema.methods.getDocChapters = function(cb) {
    this.populate('chapters').exec(cb);
};

// statics
DocSchema.statics.getSpecDoc = function(n,m,cb) {
    this.find().skip(n * m).limit(n).exec(callback);
};
DocSchema.statics.createNew = function(obj, cb) {
    var doc = new this();
    doc.name = obj.name;
    doc.des = obj.des;
    if (obj.chapter) {
        doc.chapters.push(obj.chapter);
    }
    if (obj.tag) {
        doc.tags.push(obj.tag);
    }
    doc.save(cb);
};

// middleware
DocSchema.pre('save', function (next) {
    this.updateAt = new Date();
    next();
});

mongoose.model('Doc', DocSchema);