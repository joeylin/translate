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
	var data = req.body.content;
	var index = req.body.index;
	var isAdd = req.body.isAdd;
	UserProfile.findOne({
		_id: user.profile
	}, function(err, profile) {
		if (isAdd) {
			profile.experience.push(data);
		} else {
			profile.experience[index] = data;
		}
		profile.save(function(err) {
			res.send({
				code: 200
			});
		});
	});
};
var editWorks = function(req, res) {
	var user = req.session.user;
	var data = req.body.content;
	var index = req.body.index;
	var isAdd = req.body.isAdd;
	UserProfile.findOne({
		_id: user.profile
	}, function(err, profile) {
		if (isAdd) {
			profile.works.push(data);
		} else {
			profile.works[index] = data;
		}
		profile.save(function(err) {
			res.send({
				code: 200
			});
		});
	});
};
var editSocial = function(req, res) {
	var user = req.session.user;
	var data = req.body.content;
	var index = req.body.index;
	var isAdd = req.body.isAdd;
	UserProfile.findOne({
		_id: user.profile
	}, function(err, profile) {
		if (isAdd) {
			profile.social.push(data);
		} else {
			profile.social[index] = data;
		}
		profile.save(function(err) {
			res.send({
				code: 200
			});
		});
	});
};

module.exports = function(app) {
    app.post('/api/userProfile/basic', editBasic);
    app.post('/api/userProfile/desc', editDesc);
    app.post('/api/userProfile/experience', editExperience);
    app.post('/api/userProfile/works', editWorks);
    app.post('/api/userProfile/social', editSocial);
};