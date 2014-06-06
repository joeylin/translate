var Models = require('../models');
var Job = Models.Job;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Share = Models.Share;
var Request = Models.Request;

var middleware = require('./middleware');

var getPeople = function(req, res) {
    var user = req.session.user;
    var name = req.query.name;
    var re = new RegExp(name);
    User.find({
        name: re
    }, function(err, users) {
        setRelate(users, user._id, function(results) {
            res.send({
                code: 200,
                content: results
            });
        }); 
    });
};
var getJobs = function(req, res) {
    var query = req.query;
    console.log(query);
};
var getCompany = function(req, res) {
    var query = req.query;
    console.log(query);
};
var getShare = function(req, res) {
    var query = req.query;
    console.log(query);
};
module.exports = function(app) {
    app.get('/api/search/people', getPeople);
    app.get('/api/search/jobs', getJobs);
    app.get('/api/search/company', getCompany);
    app.get('/api/search/share', getShare);
};

// helper
function setRelate(users, meId, cb) {
    var results = [];
    if (!meId) {
        return users;
    }
    User.findOne({
        _id: meId
    }, function(err, me) {
        users.map(function(user, key) {
            var obj = {
                avatar: user.avatar,
                _id: user._id,
                name: user.name,
                desc: user.desc
            };
            obj.isMe = false;
            obj.isConnected = false;
            if (user._id.toString() === meId) {
                obj.isMe = true;
                obj.isConnected = true;
            } else {
                me.connects.map(function(connect, key) {
                    if (connect.user.toString() === user._id.toString()) {
                        obj.isConnected = true;
                    }
                });
            }
            results.push(obj);
        });
        cb(results);
    });
}