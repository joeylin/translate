var Paragraph = require('../models').Paragraph;

exports.getParagraphByTopic = function(topic, callback) {
    Paragraph.find({
        topic: topic
    }).sort({
        count: 1
    }).exec(callback);
};

exports.getParagraphByHash = function(hash, callback) {
    Paragraph.find({
        hash: hash
    }, callback);
};

exports.newAndSave = function(content, topic, type, hash, count, callback) {
    var paragraph = new Paragraph();
    paragraph.content = content;
    paragraph.topic = topic;
    paragraph.type = type;
    paragraph.hash = hash;
    paragraph.count = count;
    paragraph.save(callback);
};