var Models = require('../models');
var Job = Models.Job;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Share = Models.Share;
var Request = Models.Request;

var middleware = require('./middleware');

var editBasic = function(req, res) {
	var user = req.session.user;
	var data = req.body;
	UserProfile.findOne({
		_id: user.profile
	}, function(err, profile) {

	});
};
var editDesc = function(req, res) {
	var user = req.session.user;
	var data = req.body.desc;
	UserProfile.findOne({
		_id: user.profile
	}, function(err, profile) {
		profile.desc = data;
		profile.save(function(err) {
			res.send({
				code: 200
			});
		});
	});
};
var editExperience = function(req, res) {
	var user = req.session.user;
	var data = req.body;
	UserProfile.findOne({
		_id: user.profile
	}, function(err, profile) {
		
	});
}

module.exports = function(app) {
    app.post('/api/profile/basic', editBasic);
    app.post('/api/profile/desc', editDesc);
    app.post('/api/profile/experience', editExperience);
    app.post('/api/profile/works', profileLike);
    app.post('/api/profile/social', deleteprofile);
};