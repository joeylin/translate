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
    var name = req.query.name;
    var re = new RegExp(name);
    User.find({
        name: re
    }, function(err, users) {
        res.send({
            code: 200,
            content: users
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

function setRelate(users, user) {
    if (!user) {
        return users;
    }
    users.map(function(user,key) {

    });
    return users;
};