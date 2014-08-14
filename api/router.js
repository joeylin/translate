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
var moment = require('moment');

module.exports = function(app) {
    var getLogin = function(req, res) {
        req.session.user = null;
        req.session.destroy();
        res.render('login');
    };

    // public
    var getProfile = function(req, res) {
        var id = req.params.id;
        if (!id && !req.session.user) {
            return res.redirect('/login');
        }
        var id = req.params.id;
        if (!id && req.session.user) {
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
                        var index = -1;
                        user.connects.map(function(item, key) {
                            array.push(item.user);
                            if (req.session.user && (req.session.user._id == item.toString())) {
                                index = key;
                            }
                        });
                        app.locals.shareCount = count;
                        app.locals.connects = array.slice(0, 7);
                        if (index > -1) {
                            app.locals.isConnected = true;
                        } else {
                            app.locals.isConnected = false;
                        }

                        if (req.session.user && (req.session.user.id == user.id)) {
                            app.locals.isMe = true;
                        } else {
                            app.locals.isMe = false;
                        }

                        if (req.session.user && (req.session.user.id !== user.id)) {
                            profile.view += 1;
                            profile.save();
                        }
                        if (config.skins) {
                            app.locals.skin = config.skins[profile.skinIndex || 0];
                        } else {
                            app.locals.skin = {
                                header: '',
                                body: ''
                            };
                        }
                        
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
                            Group.getJoined(user._id.toString(), 8, function(err, groups) {
                                app.locals.groups = groups || [];
                                app.locals.request = request;
                                res.render('user-profile');  
                            });
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
            var author = {
                _id: user._id,
                id: user.id,
                name: user.name,
                avatar: user.avatar,
                connectsCount: user.connects.length
            }
            if (user.registerStage == 1) {
                return res.redirect('/register/step1');
            }
            // if (user.registerStage == 2) {
            //     return res.redirect('/register/step2');
            // }
            app.locals.user = author;
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
        }).populate('user')
        .populate('group')
        .populate('from.group')
        .populate('from.user')
        .populate('from.share').exec(function(err, share) {
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
            result.liked = false;
            if ( !! author) {
                share.likes.map(function(like) {
                    if (like.toString() == author._id) {
                        result.liked = true;
                    }
                });
            }

            result.fork = share.fork;
            result.isFork = share.isFork;
            if (share.isFork) {
                result.from = {
                    user: {
                        name: share.from.user.name,
                        id: share.from.user.id,
                        _id: share.from.user._id
                    },
                    share: {
                        createAt: share.from.share.createAt,
                        content: share.from.share.content,
                        _id: share.from.share._id
                    }
                };
                if (share.from.group) {
                    result.from.group = {
                        name: share.from.group.name,
                        id: share.from.group.id,
                        _id: share.from.group._id
                    };
                }
            }
            result.has_collect = false;
            if (!!author) {
                share.collects.map(function(collect) {
                    if (collect.user.toString() == author._id.toString()) {
                        result.has_collect = true;
                    }
                });
            }

            result.likes = share.likes.length;
            result.total = share.comments.length;

            result.comments = [];
            result.user = {
                id: share.user.id,
                _id: share.user._id,
                avatar: share.user.avatar,
                name: share.user.name,
                signature: share.user.signature,
                connects: share.user.connects.length
            };
            if (share.group) {
                result.group = {
                    name: share.group.name,
                    id: share.group.id,
                    _id: share.group._id,
                    avatar: share.group.avatar
                };
            }
            Share.find({
                user: share.user._id,
                type: 'view',
                is_delete: false
            }).count().exec(function(err, count) {
                result.user.share = count;
                app.locals.share = result;
                app.locals.author = author;
                res.render('share');
            });
        });
    };
    var getJob = function(req, res) {
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
            result.jobType = share.jobType;
            result.paymentStart = share.paymentStart;
            result.paymentEnd = share.paymentEnd;
            result.department = share.department;
            result.company = share.company;
            result.companyLogo = share.companyLogo;
            result.companyIntro = marked(share.companyIntro);
            result.degree = share.degree;
            result.position = share.position;
            result.location = share.location;
            result.workYears = share.workYears;
            result.summary = marked(share.summary);
            result.detail = marked(share.detail);
            result.contact = share.contact || {};
            result.liked = false;
            result.hasPost = false;
            result.date = formatDate(share.createAt.getTime());
            app.locals.isJobCreator = false;
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
            function formatDate(date) {
                var today = Date.now();
                if (today - date >= 31 * 24 * 3600 * 1000) {
                    return '一个月前';
                } else if (today - date >= 24 * 3600 * 1000) {
                    return moment(today - date).date() + '天前';
                } else {
                    return moment(today - date).hour() + '小时前';
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
                occupation: share.user.occupation,
                signature: share.user.signature,
                connects: share.user.connects.length
            };

            Share.find({
                type: 'job',
                is_delete: false,
                random: {
                    $near: [Math.random(), 0]
                },
                _id: {
                    $nin: [share._id]
                }
            }).populate('user').limit(6).exec(function(err, shares) {
                var visitorRecord = [];
                shares.map(function(item) {
                    var obj = {
                        id: item.id,
                        position: item.position,
                        company: item.company,
                        companyLogo: item.companyLogo,
                        location: item.location,
                        date: formatDate(item.createAt.getTime()),
                    };
                    visitorRecord.push(obj);
                });

                if ( !! author) {
                    Request.find({
                        to: author._id,
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
                                app.locals.visitorRecord = visitorRecord;
                                res.render('job');
                            });
                        });
                    });
                } else {
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
                            app.locals.visitorRecord = visitorRecord;
                            res.render('job');
                        });
                    });
                }
                
            });

                

        });
    };
    var jobManage = function(req, res) {
        var id = req.params.id;
        var author = req.session.user;
        Share.findOne({
            id: id
        }).populate('user').exec(function(err, share) {
            if (err || !share) {
                return res.send({
                    code: 404,
                    info: 'cant find specified id'
                });
            }
            if (share.user.id !== author.id) {
                return res.send({
                    code: 404,
                    info: 'no auth'
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
                    res.render('jobManage');
                });
            });
        });
    };
    var getGroupHome = function(req, res) {
        var author = req.session && req.session.user;
        Group.getPopular(function(err, popular) {
            var groupPopular = [];
            popular.map(function(item) {
                var result = {
                    id: item.id,
                    _id: item._id,
                    avatar: item.avatar,
                    count: item.count,
                    followCount: item.followCount,
                    name: item.name,
                    intro: item.intro,
                    industry: item.industry,
                    total: 100
                };
                groupPopular.push(result);
            });
            if (!author) {
                app.locals.popular = groupPopular;
                res.render('group-home');
            } else {
                User.findOne({
                    _id: author._id
                }, function(err, user) {
                    Share.find({
                        user: user._id,
                        type: 'view',
                        is_delete: false
                    }).count().exec(function(err, count) {
                        app.locals.popular = groupPopular;
                        app.locals.groupCount = user.groups.create.length;
                        app.locals.author = {
                            id: user.id,
                            _id: user._id,
                            name: user.name,
                            avatar: user.avatar,
                            share: count,
                            groupCount: user.groups.create.length,
                            connects: user.connects.length
                        };
                        res.render('group-home');
                    }); 
                });
            }
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
                    code: 404,
                    info: 'no found'
                });
            }
            if (group.is_public) {
                return res.send({
                    code:404,
                    info: 'it is privite group'
                });
            }
            app.locals.group = group;
            app.locals.isJoined = false;
            app.locals.isAdmin = false;
            app.locals.isCreator = false;

            if (!group.hire.length) {
                Share.find({
                    type: 'job',
                    is_delete: false,
                    // status: 'public',
                    // createAt: {
                    //     $gt: Date.now() - 30 * 24 * 3600
                    // },
                    random: {
                        $near: [Math.random(), 0]
                    }
                }).limit(5).exec(function(err, shares) {
                    var hire = [];
                    shares.map(function(item, key) {
                        var result = {
                            id: item.id,
                            location: item.location,
                            position: item.position,
                            link: '/job/' + item.id
                        };
                        hire.push(result);
                    });
                    app.locals.hire = hire;
                    User.find({
                        'groups.follow': group._id
                    }).count().exec(function(err, count) {
                        app.locals.followCount = count || 0;
                        group.followCount = count;
                        group.save();
                        if (user) {
                            User.findOne({
                                _id: user._id
                            }).exec(function(err, user) {
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
                                app.locals.is_followed = false;
                                user.groups.follow.map(function(item, key) {
                                    if (item.toString() == group._id) {
                                        app.locals.is_followed = true;
                                        return false;
                                    }
                                });
                                app.locals.author = user;
                                res.render('group');
                            });    
                        } else {
                            res.render('group');
                        }
                    }); 
                });
            } else {
                app.locals.hire = group.hire.slice(0, 5);
                User.find({
                    'groups.follow': group._id
                }).count().exec(function(err, count) {
                    app.locals.followCount = count || 0;
                    group.followCount = count;
                    group.save();
                    if (user) {
                        User.findOne({
                            _id: user._id
                        }).exec(function(err, user) {
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
                            app.locals.is_followed = false;
                            user.groups.follow.map(function(item, key) {
                                if (item.toString() == group._id) {
                                    app.locals.is_followed = true;
                                    return false;
                                }
                            });
                            app.locals.author = user;
                            res.render('group');
                        });    
                    } else {
                        res.render('group');
                    }
                }); 
            }        
        });
    };

    var registerStep = function(req, res) {
        var user = req.session.user;
        User.findOne({
            _id: user._id
        }, function(err, user) {
            var result = {
                _id: user._id,
                id: user.id,
                name: user.name,
                avatar: user.avatar,
                email: user.email,
                registerStage: user.registerStage
            };
            app.locals.user = result;

            if (user.registerStage >= 3) {
                return res.redirect('/home');
            }
            res.render('register');
        });
    };
    var registerValidate = function(req, res) {
        var token = req.query.token;
        User.findOne({
            'emailActiveCode.code': token
        }, function(err, user) {
            if (!user) {
                return res.send({
                    code: 404,
                    info: 'wrong token'
                });
            }
            if (user.isActive) {
                return res.send({
                    code: 404,
                    info: 'has active'
                });
            }
            user.isActive = true;
            user.registerStage = 3;
            user.save(function(err) {
                // login and redirect
                req.session.user = user;
                res.redirect('/register/step3');
            });
        });
    };
    var feedback = function(req, res) {
        res.render('feedback');
    };

    // admin
    var getAdmin = function(req, res) {
        var user = req.session.user;
        User.findOne({
            _id: user._id
        }).exec(function(err, user) {
            if (user.isAdmin) {
                res.render('admin');
            } else {
                res.send({
                    code: 404,
                    info: 'no auth'
                });
            }
        });  
    }

    // home
    app.get('/', middleware.check_login, getMain);
    app.get('/home', middleware.check_login, getHome);
    app.get('/message', middleware.check_login, getHome);
    app.get('/company', middleware.check_login, getHome);
    app.get('/groupTrends', middleware.check_login, getHome);
    app.get('/share', middleware.check_login, getHome);
    app.get('/job', middleware.check_login, getHome);
    app.get('/people', middleware.check_login, getHome);
    app.get('/myPeople', middleware.check_login, getHome);
    app.get('/myCompany', middleware.check_login, getHome);
    app.get('/myShare', middleware.check_login, getHome);
    app.get('/myCollect', middleware.check_login, getHome);
    app.get('/myJob', middleware.check_login, getHome);
    app.get('/mySending', middleware.check_login, getHome);
    app.get('/myGroup', middleware.check_login, getHome);
    app.get('/posts/new', middleware.check_login, getHome);
    app.get('/jobs/new', middleware.check_login, getHome);
    app.get('/jobs/:id/edit', middleware.check_login, getHome);

    // jobManage
    app.get('/job/:id', getJob);
    app.get('/job/:id/message', middleware.check_login, jobManage);
    app.get('/job/:id/members', middleware.check_login, jobManage);


    // notify
    app.get('/request/connect', middleware.check_login, getHome);
    app.get('/request/comment', middleware.check_login, getHome);
    app.get('/request/reply', middleware.check_login, getHome);
    app.get('/request/group', middleware.check_login, getHome);
    app.get('/request/at', middleware.check_login, getHome);
    app.get('/request/notice', middleware.check_login, getHome);

    // login
    app.get('/login', getLogin);

    // register
    app.get('/register', middleware.check_login, registerStep);
    app.get('/register/step1', middleware.check_login, registerStep);
    app.get('/register/step2', middleware.check_login, registerStep);
    app.get('/register/step3', middleware.check_login, registerStep);
    app.get('/register/validate', registerValidate);

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
    app.get('/group/:id/settings', middleware.check_login, getGroup);

    // feedback
    app.get('/about/feedback', feedback);

    // admin
    app.get('/admin', getAdmin);
    app.get('/admin/group', getAdmin);
    app.get('/admin/user', getAdmin);
    app.get('/admin/count', getAdmin);
    app.get('/admin/invite', getAdmin);
    app.get('/admin/report', getAdmin);
};