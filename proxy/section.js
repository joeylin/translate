var Section = require('../models').Section;

exports.getSectionByName = function(name, callback) {
    Section.find({
        name: name
    }, callback);
};
exports.getSectionByhash = function(hash, callback) {
    Section.find({
        hash: hash
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
        hash: hash
    }, callback);
};

exports.newAndSave = function(name, hash, docHash, md, html, translate, pIndex, callback) {
    var Section = new Section();
    Section.name = name;
    Section.hash = hash;
    Section.docHash = docHash;
    Section.md = md;
    Section.html = html;
    Section.pIndex = pIndex;
    Section.translate = translate;
    Section.index = index;
    Section.save(callback);
};