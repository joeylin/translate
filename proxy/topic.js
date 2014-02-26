var Topic = require('../models').Topic;

exports.getTopicByTitle = function(title, callback) {
    Topic.find({
        title: title
    }, callback);
};
exports.getTopicById = function(id, callback) {
    Topic.find({
        _id: id
    }, callback);
};
exports.getSpecTopic = function(n, m, callback) {
    Topic.find().skip(n * m).limit(n).exec(callback);
};

exports.getTopicByCollect = function(collect, callback) {
    Topic.find({
        collect: collect
    }).sort({
        _id: -1
    }).exec(callback);
};

exports.remove = function(title, user_id, callback) {
    Topic.find({
        title: title,
        user_id: user_id
    }, callback);
};

exports.newAndSave = function(title, user_id, tag, callback) {
    var Topic = new Topic();
    Topic.title = title;
    Topic.user_id = user_id;
    Topic.tag = tag;
    Topic.save(callback);
};