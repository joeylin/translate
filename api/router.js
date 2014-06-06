var Models = require('../models');
var Doc = Models.Doc;
var Chapter = Models.Chapter;
var Section = Models.Section;
var Translate = Models.Translate;
var Job = Models.Job;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Trend = Models.Trend;
var Request = Models.Request;
var Share = Models.Share;

var fs = require('fs');
var path = require('path');
var async = require('async');
var marked = require('marked');
var config = require('../config/config').config;
var middleware = require('./middleware');

module.exports = function(app) {
    var getLogin = function(req, res) {
        res.render('login');
    };

    // public
    var getProfile = function(req, res) {
        var id = req.params.id;
        if (!id) {
            id = req.session.user.id;
            return res.redirect('/profile/' + id);
        }
        User.getProfile(id, function(err, profile, user) {
            if (err) {
                // here send 404 page
                console.log(err);
            }
            app.locals.profile = profile;
            app.locals.user = user;
            app.locals.author = req.session.user;
            if (profile.name === 'user') {
                res.render('user-profile');
            }
            if (profile.name === 'company') {
                res.render('company-profile');
            }
        });
    };
    var getShare = function(req, res) {
        if (req.session && req.session.user) {
            app.locals.user = req.session.user;
        }
        res.render('share');
    };

    // need login
    var getMain = function(req, res) {
        res.redirect('/home');
    };
    var getHome = function(req, res) {
        var user = req.session.user;
        User.findOne({
            _id: user._id
        }, function(err, user) {
            app.locals.user = user;
            if (user.role === 'user') {
                res.render('user-home');
            } else {
                res.render('company-home');
            }
        });
    };
    var getNotify = function(req, res) {
        app.locals.user = req.session.user;
        res.render('notify');
    };
    var getSearch = function(req, res) {
        app.locals.user = req.session.user;
        res.render('search');
    };
    var getProfileSettings = function(req, res) {
        var user = req.session.user;
        User.getProfile(user.id, function(err, profile, user) {
            app.locals.user = user;
            app.locals.profile = profile;
            app.locals.chooseTab = 'profile';
            if (user.role === 'user') {
                res.render('settings-user-profile');
            } else {
                res.render('settings-company-profile');
            }
        });
    };
    var getAccountSettings = function(req, res) {
        var user = req.session.user;
        User.findOne({
            _id: user._id
        }, function(err, user) {
            app.locals.user = user;
            app.locals.chooseTab = 'account';
            if (user.role === 'user') {
                res.render('settings-user-profile');
            } else {
                res.render('settings-company-profile');
            }
        });
    };

    // home
    app.get('/', middleware.check_login, getMain);
    app.get('/home', middleware.check_login, getHome);
    app.get('/message', middleware.check_login, getHome);
    app.get('/request', middleware.check_login, getHome);
    app.get('/company', middleware.check_login, getHome);
    app.get('/share', middleware.check_login, getHome);
    app.get('/job', middleware.check_login, getHome);
    app.get('/people', middleware.check_login, getHome);

    // login
    app.get('/login', getLogin);

    // profile
    app.get('/profile', getProfile);
    app.get('/profile/:id', getProfile);

    // settings
    app.get('/settings/profile', middleware.check_login, getProfileSettings);
    app.get('/settings/account', middleware.check_login, getAccountSettings);

    // notification
    app.get('/notify', middleware.check_login, getNotify);
    app.get('/notify/:op', middleware.check_login, getNotify);

    // share
    app.get('/share', getShare);
    app.get('/share/:id', getShare);

    // search 
    app.get('/search', middleware.check_login, getSearch);
    app.get('/search/:op', middleware.check_login, getSearch);
};