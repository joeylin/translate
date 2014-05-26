var mongoose = require('mongoose');
var config = require('../config/config.js').config;

mongoose.connect(config.db, function(err) {
    if (err) {
        console.error('connect to %s error: ', config.db, err.message);
        process.exit(1);
    }
});

// Translate models 
require('./doc');
require('./chapter');
require('./section');
require('./translate');

exports.Doc = mongoose.model('Doc');
exports.Chapter = mongoose.model('Chapter');
exports.Section = mongoose.model('Section');
exports.Translate = mongoose.model('Translate');

// social network
require('./user');
require('./userProfile');
require('./companyProfile');
require('./job');
require('./share');
require('./comment');
require('./trend');

exports.User = mongoose.model('User');
exports.UserProfile = mongoose.model('UserProfile');
exports.CompanyProfile = mongoose.model('CompanyProfile');
exports.Job = mongoose.model('Job');
exports.Share = mongoose.model('Share');
exports.Comment = mongoose.model('Comment');
exports.Trend = mongoose.model('Trend');