var TopicCollect = require('../models').TopicCollect;

exports.getTopicCollect = function(userId, name, callback) {
    TopicCollect.findOne({
        user_id: userId,
        collect_name: name
    }, callback);
};

exports.getTopicCollectsByUserId = function(userId, callback) {
    TopicCollect.find({
        user_id: userId
    }, callback);
};
exports.getTopicCollectsByName = function(name, callback) {
    TopicCollect.find({
        collect_name: name
    }, callback);
};

exports.newAndSave = function(userId, name, callback) {
    var topic_collect = new TopicCollect();
    topic_collect.user_id = userId;
    topic_collect.collect_name = name;
    topic_collect.save(callback);
};

exports.remove = function(userId, name, callback) {
    TopicCollect.remove({
        user_id: userId,
        collect_name: name
    }, callback);
};