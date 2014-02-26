var TopicTag = require('../models').TopicTag;

exports.getTagById = function(tagId, callback) {
    TopicTag.find({
        _id: tagId
    }, callback);
};
exports.getTagByName = function(name, callback) {
    TopicTag.find({
        tag_name: name
    }, callback);
};

exports.getTagByTopicId = function(topicId, callback) {
    TopicTag.find({
        topic_id: topicId
    }, callback);
};

exports.removeByTagId = function(tagId, callback) {
    TopicTag.remove({
        _id: tagId
    }, callback);
};
exports.removeByTagName = function(name, callback) {
    TopicTag.remove({
        tag_name: name
    }, callback);
};

exports.newAndSave = function(topicId, tagId, callback) {
    var topic_tag = new TopicTag();
    topic_tag.topic_id = topicId;
    topic_tag.tag_id = tagId;
    topic_tag.save(callback);
};