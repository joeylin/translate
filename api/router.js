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
var Group = Models.Group;

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
                User.findOne({
                    _id: user._id
                }).populate('connects.user').exec(function(err, user) {
                    Share.find({
                        user: user._id,
                        is_delete: false,
                        type: 'view'
                    }).count().exec(function(err, count) {
                        var array = [];
                        user.connects.map(function(item, key) {
                            array.push(item.user);
                        });
                        app.locals.shareCount = count;
                        app.locals.connects = array.slice(0, 7);

                        Request.find({
                            to: user._id,
                            hasDisposed: false
                        }, function(err, requests) {
                            var comment = [];
                            var reply = [];
                            var group = [];
                            var connect = [];
                            var at = [];
                            requests.map(function(request) {
                                if (request.type === 'comment') {
                                    comment.push(request);
                                }
                                if (request.type === 'group') {
                                    group.push(request);
                                }
                                if (request.type === 'reply') {
                                    reply.push(request);
                                }
                                if (request.type === 'connect') {
                                    connect.push(request);
                                }
                                if (request.type === 'at') {
                                    at.push(request);
                                }
                            });
                            var request = {
                                comment: comment.length,
                                reply: reply.length,
                                group: group.length,
                                connect: connect.length,
                                at: at.length
                            };

                            app.locals.request = request;
                            res.render('user-profile');
                        });
                    });
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
                Share.find({
                    user: user._id,
                    is_delete: false,
                    type: 'view'
                }).count().exec(function(err, count) {
                    app.locals.shareCount = count;
                    res.render('user-home');
                });
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
            result.department = share.department;
            result.company = share.company;
            result.companyIntro = share.companyIntro;
            result.degree = share.degree;
            result.position = share.position;
            result.location = share.location;
            result.workYears = share.workYears;
            result.summary = share.summary;
            result.detail = share.detail;
            result.liked = false;
            result.hasPost = false;
            if ( !! author) {
                share.likes.map(function(like) {
                    if (like.toString() == author._id) {
                        result.liked = true;
                    }
                });
                share.resumes.map(function(item, key) {
                    if (item.user.toString() == author._id) {
                        result.hasPost = true;
                    }
                });
                if (share.user._id.toString() == author._id) {
                    app.locals.isJobCreator = true;
                }
            }

            result.likes = share.likes.length;
            result.total = share.comments.length;
            result.join = share.resumes.length;

            result.comments = [];
            result.user = {
                id: share.user.id,
                _id: share.user._id,
                avatar: share.user.avatar,
                name: share.user.name,
                role: share.user.role,
                signature: share.user.signature,
                connects: share.user.connects.length
            };
            Share.find({
                user: share.user._id,
                is_delete: false
            }).count().exec(function(err, count) {
                share.views = share.views + 1;
                result.views = share.views;
                share.save(function(err, share) {
                    result.user.share = count;
                    app.locals.share = result;
                    app.locals.author = author;
                    res.render('share');
                });
            });
        });
    };
    var getSignupPage = function(req, res) {
        res.render('signup');
    };
    var getGroupHome = function(req, res) {
        var author = req.session && req.session.user;
        Group.getLastest(function(err, lastest) {
            Group.getPopular(function(err, popular) {
                var groupPopular = [];
                popular.map(function(item) {
                    var result = {
                        id: item.id,
                        _id: item._id,
                        avatar: item.avatar,
                        count: item.count,
                        name: item.name,
                        industry: item.industry,
                        total: 100
                    };
                    groupPopular.push(result);
                });
                var groupLatest = [];
                lastest.map(function(item) {
                    var result = {
                        id: item.id,
                        _id: item._id,
                        avatar: item.avatar,
                        count: item.count,
                        name: item.name,
                        industry: item.industry,
                        total: 100
                    };
                    groupLatest.push(result);
                });
                if (!author) {
                    app.locals.popular = groupPopular;
                    app.locals.newGroup = groupLatest;
                    res.render('group-home');
                } else {
                    User.findOne({
                        _id: author._id
                    }, function(err, user) {
                        app.locals.popular = groupPopular;
                        app.locals.newGroup = groupLatest;
                        app.locals.author = user;
                        res.render('group-home');
                    });
                }

            });
        });
    };
    var getGroup = function(req, res) {
        var user = req.session.user;
        var id = req.params.id;
        Group.findOne({
            id: id
        }).populate('creator').populate('admin').populate('members').exec(function(err, group) {
            if (!group) {
                // here send 404 page
                return res.send({
                    code: 404
                });
            }
            app.locals.group = group;
            app.locals.author = user;
            app.locals.isJoined = false;
            app.locals.isAdmin = false;
            app.locals.isCreator = false;
            if (user) {
                var adminIndex = -1;
                var memberIndex = -1;
                if (group.creator._id.toString() == user._id) {
                    app.locals.isCreator = true;
                }
                group.admin.map(function(item, key) {
                    if (item._id.toString() == user._id) {
                        adminIndex = key;
                    }
                });
                group.members.map(function(item, key) {
                    if (item._id.toString() == user._id) {
                        memberIndex = key;
                    }
                });
                if (adminIndex > -1) {
                    app.locals.isAdmin = true;
                }
                if (memberIndex > -1 || adminIndex > -1 || app.locals.isCreator) {
                    app.locals.isJoined = true;
                }
            }
            res.render('group');
        });
    };

    // home
    app.get('/', middleware.check_login, getMain);
    app.get('/home', middleware.check_login, getHome);
    app.get('/message', middleware.check_login, getHome);
    app.get('/company', middleware.check_login, getHome);
    app.get('/share', middleware.check_login, getHome);
    app.get('/job', middleware.check_login, getHome);
    app.get('/people', middleware.check_login, getHome);
    app.get('/myPeople', middleware.check_login, getHome);
    app.get('/myCompany', middleware.check_login, getHome);
    app.get('/myShare', middleware.check_login, getHome);
    app.get('/myJob', middleware.check_login, getHome);
    app.get('/mySending', middleware.check_login, getHome);
    app.get('/myGroup', middleware.check_login, getHome);
    app.get('/posts/new', middleware.check_login, getHome);
    app.get('/jobs/new', middleware.check_login, getHome);
    app.get('/jobs/:id/edit', middleware.check_login, getHome);

    // notify
    app.get('/request/connect', middleware.check_login, getHome);
    app.get('/request/comment', middleware.check_login, getHome);
    app.get('/request/reply', middleware.check_login, getHome);
    app.get('/request/group', middleware.check_login, getHome);
    app.get('/request/at', middleware.check_login, getHome);
    app.get('/request/all', middleware.check_login, getHome);

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

    //group
    app.get('/group', getGroupHome);
    app.get('/group/home', getGroupHome);
    app.get('/group/search', getGroupHome);
    app.get('/group/:id', getGroup);
    app.get('/group/:id/settings', getGroup);
};