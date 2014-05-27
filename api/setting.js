var Models = require('../models');
var Job = Models.Job;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Trend = Models.Trend;
var Share = Models.Share;
var Request = Models.Request;

var editBasic = function(req, res) {
    var user = req.session.user;
    var display_name = req.body.display_name;
    var email = req.body.email;
    var desc = req.body.res;
    User.find({
        _id: user._id
    }, function(err, user) {
        var _user = user[0];
        _user.display_name = display_name;
        _user.email = email;
        _user.desc = desc;
        _user.save(function(err) {
            req.session.user = _user;
            res.send({
                code: 200,
                user: _user
            });
        });
    });
};
var editPassword = function(req, res) {
    var user = req.session.user;
    var origin = req.body.originPassword;
    var password = req.body.newPassword;
    User.find({
        _id: user._id
    }, function(err, user) {
        var _user = user[0];
        if (!_user.authenticate(password)) {
            res.send({
                code: 404,
                info: 'wrong password !'
            });
        } else {
            req.session.user = _user;
            res.send({
                code: 200,
                user: _user
            });
        }
    });
};
var editAvatar = function(req, res) {
    var user = req.session.user;
    var avatar = req.body.avatar;
    User.find({
        _id: user._id
    }, function(err, user) {
        var _user = user[0];
        _user.avatar = avatar;
        _user.save(function(err) {
            req.session.user = _user;
            res.send({
                code: 200,
                user: _user
            });
        });
    });
};

module.exports = function(app) {
    // user
    app.post('/api/user/edit/basic', editBasic);
    app.post('/api/user/edit/password', editPassword);
    app.post('/api/user/edit/avatar', editAvatar);

};