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
    next();
};
// for settings
var check_auth = function(req, res, next) {
    var page = req.params.op;
    if (!req.session.user && page !== 'login') {
        res.redirect('/settings/login');
    } else {
        next();
    }
};
var groupSettingsAuth = function(req, res, next) {
    var user = req.session.user;
    var id = req.params.id;
    if (!id) {
        return res.render('404');
    }
    if (!user) {
        return res.redirect('/group/' + id);
    }
    Group.findOne({
        id: id
    }, function(err, group) {
        if (group.isCreator(user._id) || group.isAdmin(user._id)) {
            next();
        } else {
            res.render('404');
        }
    });
};
exports.check_login = check_login;
exports.check_admin = check_admin;
exports.check_auth = check_auth;
exports.groupSettingsAuth = groupSettingsAuth;