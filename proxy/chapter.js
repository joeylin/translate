var Chapter = require('../models').Chapter;

exports.getChapterByTitle = function(name, callback) {
    Chapter.find({
        name: name
    }, callback);
};
exports.getChapterById = function(id, callback) {
    Chapter.find({
        _id: id
    }, callback);
};
exports.getSpecChapter = function(n, m, callback) {
    Chapter.find().skip(n * m).limit(n).exec(callback);
};

exports.getChapterAndSection = function(id, callback) {
    Chapter.find({
        _id: id
    }, callback);
};
exports.pushSection = function(id, section, callback) {
    var chapter = Chapter.find({
        _id: id
    });
    chapter.sections.push(section);
    chapter.save(callback);
};
exports.remove = function(id, callback) {
    Chapter.find({
        _id: id,
    }, callback);
};
exports.newAndSave = function(name, index, section, doc, callback) {
    var chapter = new Chapter();
    chapter.name = name;
    chapter.doc = doc;
    chapter.index = index;
    if (section) {
        chapter.sections.push(section);
    }
    chapter.save(callback);
};