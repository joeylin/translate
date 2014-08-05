var mongoose = require('mongoose');
var config = require('../config/config.js').config;

mongoose.connect(config.db, function(err) {
    if (err) {
        console.error('connect to %s error: ', config.db, err.message);
        process.exit(1);
    }
});

// social network
require('./user');
require('./userProfile');
require('./companyProfile');
require('./job');
require('./share');
require('./comment');
require('./trend');
require('./request');
require('./group');
require('./idGenerator');
require('./invitation');
require('./feedback');

exports.User = mongoose.model('User');
exports.UserProfile = mongoose.model('UserProfile');
exports.CompanyProfile = mongoose.model('CompanyProfile');
exports.Job = mongoose.model('Job');
exports.Share = mongoose.model('Share');
exports.Comment = mongoose.model('Comment');
exports.Trend = mongoose.model('Trend');
exports.Request = mongoose.model('Request');
exports.Group = mongoose.model('Group');
exports.IdGenerator = mongoose.model('IdGenerator');
exports.Invitation = mongoose.model('Invitation');
exports.Feedback = mongoose.model('Feedback');