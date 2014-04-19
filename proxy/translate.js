var models = require('../models');
var Translate = models.Translate;

/**
 *
 * Callback:
 * - err, 数据库异常
 * - translate,
 * @param {String} hash
 * @param {Function} callback 回调函数
 */
exports.getTranslateByHash = function(hash, callback) {
    Translate.find({
        'hash': hash
    }, callback);
};

exports.addOneVote = function(hash, callback) {
    Translate.update({
        hash: hash
    }, {
        $inc: {
            vote: 1
        }
    }, callback);
};

exports.getUsersByIds = function(ids, callback) {
    Translate.find({
        '_id': {
            '$in': ids
        }
    }, callback);
};

exports.newAndSave = function(content, topic, hash, callback) {
    var translate = new Translate();
    translate.content = content;
    translate.user_id = user_id;
    translate.hash = hash;
    translate.save(callback);
};

exports.remove = function(hash, callback) {
    Translate.remove({
        hash: hash,
    }, callback);
};