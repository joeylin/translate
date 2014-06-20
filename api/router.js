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
                var array = [];
                user.connects.map(function(item) {
                    array.push(item.user.toString());
                });
                User.find({
                    _id: {
                        $in: array
                    }
                }, function(err, users) {
                    app.locals.connects = users.slice(0, 5);
                    res.render('user-profile');
                });

            }
            if (profile.name === 'company') {
                app.locals.isLiked = req.session.user && user.isLike(req.session.user._id);
                app.locals.isFollowed = req.session.user && user.isFollow(req.session.user._id);
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
            app.locals.lastUpdate = profile.updateAt.getTime();
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
    var getView = function(req, res) {
        var id = req.params.id;
        var author = req.session && req.session.user;
        Share.findOne({
            id: id
        }).populate('user').exec(function(err, share) {
            if (err || !share) {
                res.send({
                    code: 404,
                    info: 'cant find specified id'
                });
            }
            var result = {};
            result.type = share.type;
            result.content = share.content;
            result._id = share._id;
            result.id = share.id;
            result.createAt = share.createAt.getTime();
            result.jobType = share.jobType;
            result.paymentStart = share.paymentStart;
            result.paymentEnd = share.paymentEnd;
            result.degree = share.degree;
            result.position = share.position;
            result.location = share.location;
            result.workYears = share.workYears;
            result.summary = share.summary;
            result.detail = share.detail;
            result.liked = false;
            if (author) {
                share.likes.map(function(like) {
                    if (like.toString() == author._id) {
                        result.liked = true;
                    }
                });
            }
            result.likes = share.likes.length;
            result.total = share.comments.length;
            // todo: fix pager
            result.comments = [];
            result.user = {
                id: share.user.id,
                _id: share.user._id,
                avatar: share.user.avatar,
                name: share.user.name,
                role: share.user.role,
                signature: share.user.signature,
                followers: share.user.followers.length,
            };
            Share.find({
                user: share.user._id,
                is_delete: false
            }).count().exec(function(err, count) {
                result.user.share = count;
                app.locals.share = result;
                app.locals.author = author;
                res.render('share');
            });
        });
    };
    var getSignupPage = function(req, res) {
        res.render('signup');
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
    app.get('/myPeople', middleware.check_login, getHome);
    app.get('/myCompany', middleware.check_login, getHome);
    app.get('/myShare', middleware.check_login, getHome);
    app.get('/myJob', middleware.check_login, getHome);
    app.get('/mySending', middleware.check_login, getHome);
    app.get('/posts/new', middleware.check_login, getHome);
    app.get('/jobs/new', middleware.check_login, getHome);

    // login
    app.get('/login', getLogin);

    //signup
    app.get('/signup', getSignupPage);
    app.get('/signup/user/basic', getSignupPage);
    app.get('/signup/company/basic', getSignupPage);

    // profile
    app.get('/profile', getProfile);
    app.get('/profile/:id', getProfile);

    // settings
    app.get('/settings/profile', middleware.check_login, getProfileSettings);
    app.get('/settings/account', middleware.check_login, getAccountSettings);

    // notification
    app.get('/notify', middleware.check_login, getNotify);
    app.get('/notify/:op', middleware.check_login, getNotify);

    // view
    app.get('/view', getView);
    app.get('/view/:id', getView);

    // search 
    app.get('/search', middleware.check_login, getSearch);
    app.get('/search/:op', middleware.check_login, getSearch);
};