var Section = require('../models').Section;

exports.getSectionByName = function(name, callback) {
    Section.find({
        name: name
    }, callback);
};
exports.getSectionByhash = function(id, callback) {
    Section.find({
        _id: id
    }, callback);
};
exports.getSpecSection = function(n, m, callback) {
    Section.find().skip(n * m).limit(n).exec(callback);
};

exports.getSectionByDocHash = function(docHash, callback) {
    Section.find({
        docHash: docHash
    }).sort({
        index: -1
    }).exec(callback);
};

exports.remove = function(name, hash, callback) {
    Section.remove({
        name: name,
        _id: id
    }, callback);
};

exports.newAndSave = function(chapterId, docId, md, html, translate, index, callback) {
    var Section = new Section();
    Section.chapterId = chapterId;
    Section.docId = docId;
    Section.md = md;
    Section.html = html;
    Section.index = index;
    Section.translate = translate;
    Section.save(callback);
};