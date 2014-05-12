var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ChapterSchema = new Schema({
    name: {
        type: String
    },
    doc: {
        type: String,
        ref: 'Doc'
    },
    index: {
        type: Number,
        default: 0
    },
    sections: [{
        type: ObjectId,
        ref: 'Section'
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

ChapterSchema.virtual('total').get(function() {
    return this.sections.length;
});

// method
ChapterSchema.methods.getChapterSections = function(cb) {
    this.populate('sections').exec(cb);
};
// static
ChapterSchema.statics.createNew = function(obj, cb) {
    var chapter = new this();
    chapter.name = obj.name;
    chapter.doc = obj.doc;
    chapter.index = obj.index;
    if (obj.section) {
        chapter.sections.push(obj.section);
    }
    chapter.save(cb);
};
ChapterSchema.statics.delById = function(id) {
    var Doc = mongoose.model('Doc');

};

// middleware
ChapterSchema.pre('save', function(next) {

    this.updateAt = new Date();
    next();
});

mongoose.model('Chapter', ChapterSchema);