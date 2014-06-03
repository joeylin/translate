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
        user.display_name = data.display_name;
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
        user.name = data.name;
        user.sex = data.sex;
        user.degree = data.degree;
        user.workYear = parseInt(data.workYear, 10);
        user.phone = data.phone;
        user.current = data.current;
        user.save(function(err) {
            if (err) {
                console.log(err);
                res.send({
                    code: 404,
                    info: err.message
                });
            }
            res.send({
                code: 200
            });
        });
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
    var type = req.body.type;
    UserProfile.findOne({
        _id: user.profile
    }, function(err, profile) {
        if (type === 'add') {
            profile.experience.push(data);
        }
        if (type === 'edit') {
            profile.experience[index].startDate = data.startDate;
            profile.experience[index].endDate = data.endDate;
            profile.experience[index].company = data.company;
            profile.experience[index].title = data.title;
            profile.experience[index].location = data.location;
            profile.experience[index].isCurrentJob = data.isCurrentJob;
            profile.experience[index].desc = data.desc;
        }
        if (type === 'delete') {
            profile.experience.splice(index, 1);
        }
        profile.save(function(err) {
            if (err) {
                console.log(err);
                return res.send({
                    code: 404,
                    info: err.message
                });
            }
            res.send({
                code: 200
            });
        });
    });
};
var editEdu = function(req, res) {
    var user = req.session.user;
    var data = req.body.content;
    var index = req.body.index;
    var type = req.body.type;
    UserProfile.findOne({
        _id: user.profile
    }, function(err, profile) {
        if (type === 'add') {
            profile.edu.push(data);
        }
        if (type === 'edit') {
            profile.edu[index].startDate = data.startDate;
            profile.edu[index].endDate = data.endDate;
            profile.edu[index].degree = data.degree;
            profile.edu[index].field = data.field;
            profile.edu[index].school = data.school;
            profile.edu[index].desc = data.desc;
        }
        if (type === 'delete') {
            profile.edu.splice(index, 1);
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
    var type = req.body.type;
    UserProfile.findOne({
        _id: user.profile
    }, function(err, profile) {
        if (type === 'add') {
            profile.works.push(data);
        }
        if (type === 'edit') {
            profile.works[index].url = data.url;
            profile.works[index].desc = data.desc;
        }
        if (type === 'delete') {
            profile.works.splice(index, 1);
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
    var type = req.body.type;
    UserProfile.findOne({
        _id: user.profile
    }, function(err, profile) {
        if (type === 'add') {
            profile.social.push(data);
        }
        if (type === 'edit') {
            profile.social[index].name = data.name;
            profile.social[index].id = data.id;
        }
        if (type === 'delete') {
            profile.social.splice(index, 1);
        }
        profile.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};

module.exports = function(app) {
    app.post('/api/userProfile/header', editHeader);
    app.post('/api/userProfile/basic', editBasic);
    app.post('/api/userProfile/desc', editDesc);
    app.post('/api/userProfile/experience', editExperience);
    app.post('/api/userProfile/edu', editEdu);
    app.post('/api/userProfile/works', editWorks);
    app.post('/api/userProfile/social', editSocial);
};