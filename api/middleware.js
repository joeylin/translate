var Models = require('../models');
var Job = Models.Job;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Share = Models.Share;
var Request = Models.Request;
var Group = Models.Group;

var check_login = function(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        var redirectTo = req.path;
        if (redirectTo && redirectTo !== '/') {
            res.redirect('/login?re=' + redirectTo);
        } else {
            res.redirect('/login');
        }
    }
};
var check_admin = function(req, res, next) {
    var user = req.session.user;
    if (user && user.isAdmin) {
        next();
    } else {
        res.send({
            code: 404,
            info: 'no auth'
        });
    }
};
var apiLogin = function(req, res, next) {
    var user = req.session.user;
    if (!user) {
        res.send({
            code: 404,
            info: 'no login'
        });
    } else {
        next();
    }
};
var authLogin = function(req, res, next) {
    var user = req.session.user;
    if (!user) {
        res.send({
            code: 401,
            info: 'no login'
        });
    } else {
        next();
    }
};
exports.check_login = check_login;
exports.apiLogin = apiLogin;
exports.authLogin = authLogin;
exports.check_admin = check_admin;