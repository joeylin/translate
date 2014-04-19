var Doc = require('../models').Doc;
var Tag = require('../models').Tag;
var Chapter = require('../models').Chapter;

exports.getDocByName = function(name, callback) {
    Doc.find({
        name: name
    }, callback);
};
exports.getDocById = function(id, callback) {
    Doc.find({
        _id: id
    }, callback);
};
exports.getSpecDoc = function(n, m, callback) {
    Doc.find().skip(n * m).limit(n).exec(callback);
};
exports.getDocAndChapter = function(id, callback) {
    Doc.find({
        _id: id
    }).populate('chapters').exec(callback);
};

exports.pushChapter = function(docId, chapter, callback) {
    var doc = Doc.find({
        _id: docId
    });
    doc.chapters.push(chapter);
    doc.save(callback);
};
exports.pushTag = function(docId, tag, callback) {
    var doc = Doc.find({
        _id: docId
    });
    doc.tags.push(tag);
    doc.save(callback);
};
exports.remove = function(name, id, callback) {
    Doc.remove({
        name: name,
        _id: id
    }, callback);
};
exports.newAndSave = function(name, describe, hash, chapter, tag, callback) {
    var doc = new Doc();
    doc.name = name;
    doc.hash = hash;
    doc.des = describe;
    if (chapter) {
        doc.chapters.push(chapter);
    }
    if (tag) {
        doc.tags.push(tag);
    }
    doc.save(callback);
};