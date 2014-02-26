var mongoose = require('mongoose');
var config = require('../config').config;

mongoose.connect(config.db, function(err) {
    if (err) {
        console.error('connect to %s error: ', config.db, err.message);
        process.exit(1);
    }
});

// models 
require('./user');
require('./tag');
require('./topic');
require('./paragraph');
require('./translate');
require('./translate_vote');
require('./topic_collect');


exports.User = mongoose.model('User');
exports.TopicTag = mongoose.model('Tag');
exports.Topic = mongoose.model('Topic');
exports.Topic = mongoose.model('Paragraph');
exports.Topic = mongoose.model('Translate');
exports.Topic = mongoose.model('TranslateVote');
exports.TopicCollect = mongoose.model('TopicCollect');