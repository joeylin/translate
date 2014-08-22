var Models = require('../models');
var Job = Models.Job;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Trend = Models.Trend;
var Request = Models.Request;
var Share = Models.Share;
var Group = Models.Group;
var IdGenerator = Models.IdGenerator;
var Invitation = Models.Invitation;
var Feedback = Models.Feedback;

var async = require('async');
var moment = require('moment');
var email = require('../lib/email');

User.find({
    role: 'user',
    is_delete: false
}).exec(function(err, users) {
    if (err || !users) {
        console.log(err || 'error');
        return false;
    }
    users.map(function(item, key) {
        var connects = item.connects;
        connects.map(function(con, _key) {
            if (con.user.toString() == item._id.toString()) {
                item.connects.splice(item.connects.indexOf(con), 1);
                console.log('find one');
            }
        });
        item.markModified('connects');
        item.save(function(err) {
            console.log('saved');
        });
    });
});