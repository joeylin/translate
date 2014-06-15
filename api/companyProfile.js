var Models = require('../models');
var Job = Models.Job;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Share = Models.Share;
var Request = Models.Request;

var middleware = require('./middleware');

var editHeader = function(req, res) {
    var user = req.session.user;
    var data = req.body;
    User.findOne({
        _id: user._id
    }, function(err, user) {
        user.name = data.name;
        user.signature = data.signature;
        user.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};
var editBasic = function(req, res) {
    var user = req.session.user;
    var data = req.body;
    User.findOne({
        _id: user._id
    }, function(err, user) {
        user.page = data.page;
        user.industry = data.industry;
        user.scale = data.scale;
        user.phase = data.phase;
        user.location = data.location;
        user.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};
var editDesc = function(req, res) {
    var user = req.session.user;
    var teamDesc = req.body.teamDesc;
    var productDesc = req.body.productDesc;
    CompanyProfile.findOne({
        _id: user.profile
    }, function(err, profile) {
        profile.teamDesc = teamDesc;
        profile.productDesc = productDesc;
        profile.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};

module.exports = function(app) {
    app.post('/api/companyProfile/header', editHeader);
    app.post('/api/companyProfile/basic', editBasic);
    app.post('/api/companyProfile/desc', editDesc);
};