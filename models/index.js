var mongoose = require('mongoose');
var config = require('../config/config.js').config;

mongoose.connect(config.db, function(err) {
    if (err) {
        console.error('connect to %s error: ', config.db, err.message);
        process.exit(1);
    }
});

// models 
require('./user');
require('./tag');

require('./doc');
require('./chapter');
require('./section');
require('./translate');


exports.User = mongoose.model('User');
exports.TopicTag = mongoose.model('Tag');

exports.Doc = mongoose.model('Doc');
exports.Chapter = mongoose.model('Chapter');
exports.Section = mongoose.model('Section');
exports.Translate = mongoose.model('Translate');