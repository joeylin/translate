var Models = require('../models');
var Job = Models.Job;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Trend = Models.Trend;
var Request = Models.Request;
var Share = Models.Share;
var IdGenerator = Models.IdGenerator;

var middleware = require('./middleware');
var async = require('async');

var create = function(req, res) {
    var options = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        sex: req.body.sex,
        role: req.body.role || 'user'
    };
    var user = new User(options);
    var profile;
    if (options.role === 'user') {
        profile = new UserProfile({
            user: user._id,
            name: 'user'
        });
    }
    if (options.role === 'company') {
        profile = new CompanyProfile({
            user: user._id,
            name: 'company'
        });
    }
    user.provider = 'local';
    profile.save(function(err, _profile) {
        IdGenerator.getNewId('user', function(err, doc) {
            user.id = doc.currentId;
            user.profile = _profile._id;
            user.save(function(err, user) {
                if (err) {
                    var message = err.message;
                    return res.send({
                        code: 404,
                        user: null,
                        info: message
                    });
                }
                req.session.user = user;
                res.send({
                    code: 200,
                    user: req.session.user
                });
            });
        });
    });
};
var login = function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    User.findOne({
        email: email
    }, function(err, user) {
        if (err) {
            console.log('xxxnone users');
            return false;
        }
        if (!user) {
            return res.send({
                code: 404,
                user: null,
                info: 'unkown user'
            });
        }
        if (!user.authenticate(password)) {
            return res.send({
                code: 404,
                user: null,
                info: 'error user or password'
            });
        }
        req.session.user = user;
        res.send({
            code: 200,
            user: req.session.user
        });
    });
};
var logout = function(req, res) {
    req.session.destroy();
    res.send({
        code: 200,
        user: null
    });
};
var findUser = function(req, res) {
    var id = req.body.id;
    User.findOne({
        _id: id
    }).exec(function(err, user) {
        if (err) {
            console.log('err find');
        }
        if (!user) {
            return res.send({
                status: false,
                info: 'unkown user'
            });
        } else {
            res.send({
                status: true,
                user: user
            });
        }
    });
};
var sendNotify = function(req, res) {
    var user = req.session.user;
    var obj = {
        from: user._id,
        to: req.body.id,
        type: req.body.type,
        content: req.body.content
    };
    Request.createNew(obj, function(err, request) {
        if (err) {
            console.log(err);
        }
        User.findOne({
            _id: req.body.id
        }, function(err, user) {
            user.notify.request.push(request._id);
            user.save(function(err) {
                res.send({
                    code: 200,
                    info: 'request has sent'
                });
            });
        });
    });
};
var sendMessage = function(req, res) {};
var readMessage = function(req, res) {};
var checkConnect = function(req, res) {
    var user = req.session.user;
    var requestId = req.body.requestId;
    var value = req.body.value;

    User.findOne({
        _id: user._id
    }, function(err, user) {
        Request.findOne({
            _id: requestId
        }, function(err, request) {
            if (user.checkConnected(request.from)) {
                return res.send({
                    code: 404,
                    info: 'has connected'
                });
            }
            if (value) {
                user.connect(request.from, request.content, function(err, user) {
                    request.dispose(true, function() {
                        user.dealRequest(request._id, function(err) {
                            res.send({
                                code: 200,
                                info: 'success check false'
                            });
                        });

                    });
                });
            } else {
                request.dispose(false, function() {
                    user.dealRequest(request, function() {
                        res.send({
                            code: 200,
                            info: 'success check true'
                        });
                    });
                });
            }
        });
    });
};
var disconnect = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    User.findOne({
        _id: user._id
    }, function(err, user) {
        user.disconnect(id, function(err, user) {
            res.send({
                code: 200,
                info: 'success'
            });
        });
    });
};
var getNotify = function(req, res) {
    var user = req.session.user;
    User.findOne({
        _id: user._id
    }).exec(function(err, user) {
        res.send({
            code: 200,
            notify: user.notify
        });
    });
};
var getRequest = function(req, res) {
    var user = req.session.user;
    Request.find({
        to: user._id
    }).populate('from').exec(function(err, requests) {
        checkUserRequest(requests, user._id, function(err) {
            res.send({
                code: 200,
                requests: requests
            });
        });

    });
};
var readRequest = function(req, res) {
    var user = req.session.user;
    var requestId = req.body.requestId;
    Request.findOne({
        _id: notifyId
    }, function(err, notify) {
        if (notify.to === user._id) {
            notify.hasRead = true;
            notify.save(function(err) {
                res.send({
                    code: 200,
                    info: 'read'
                });
            });
        }
    });
};
var getShare = function(req, res) {
    var user = req.session.user;
    var connects = user.connects;
    var page = req.params.page || 0;
    var perPageItems = 20;

    var connectList = [];
    connects.map(function(value, key) {
        connectList.push(value.user);
    });
    // todo: avoid using skip() for performance
    Share.find({
        user: {
            $in: connectList
        }
    }).sort({
        createAt: -1
    }).populate('user').skip(page * perPageItems).limit(perPageItems).exec(function(err, share) {
        Share.find({
            user: {
                $in: connectList
            }
        }).count().exec(function(err, count) {
            if (err) {
                return res.send({
                    code: 404
                });
            }
            res.send({
                code: 200,
                content: share.length ? share : [],
                count: count,
                hasNext: (count - page * perPageItems) > 0 ? true : false
            });
        });
    });
};
var getTrends = function(req, res) {
    var user = req.session.user;
    var page = req.params.page || 1;
    var perPageItems = 20;
    User.findOne({
        _id: user._id
    }, function(err, user) {
        var connectList = [];
        user.connects.map(function(value, key) {
            connectList.push(value.user);
        });
        var followList = connectList.concat(user.followers);
        Trend.find({
            user: {
                $in: followList
            }
        }).sort({
            createAt: -1
        }).populate('share').populate('job').skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, trend) {
            if (err) {
                return res.send({
                    code: 404
                });
            }
            Trend.find({
                user: {
                    $in: followList
                }
            }).count().exec(function(err, count) {
                var content = [];
                var hasNext;
                trend.map(function(item, key) {
                    var result = {};
                    if (item.name === 'Share') {
                        for (var name in item.share) {
                            result[name] = item.share[name];
                        }
                        result.name = 'share';
                        content.push(result);
                    } else {
                        for (var i in item.job) {
                            result[i] = item.job[i];
                        }
                        result.name = 'job';
                        content.push(result);
                    }
                });
                if ((page - 1) * perPageItems + content.length < count) {
                    hasNext = true;
                } else {
                    hasNext = false;
                }
                res.send({
                    code: 200,
                    count: count,
                    hasNext: hasNext,
                    content: content
                });
            });
        });

    });
};

module.exports = function(app) {
    app.post('/api/user/register', create);
    app.post('/api/user/login', login);
    app.post('/api/user/logout', logout);

    // trends
    app.get('/api/user/share', middleware.check_login, getShare);
    app.get('/api/user/trend', middleware.check_login, getTrends);

    // notify
    app.get('/api/notify', getNotify);
    app.get('/api/notify/request', getRequest);
    // app.post('/api/notify/read', readRequest);

    // connect
    app.post('/api/connect/send', sendNotify);
    app.post('/api/connect/check', checkConnect);
    app.post('/api/connect/disconnect', disconnect);

    // message
    app.post('/api/message/send', sendMessage);
    app.post('/api/message/read', readMessage);
};

// check request status
function checkUserRequest(requests, userId, cb) {
    User.findOne({
        _id: userId
    }, function(err, user) {
        var userRequsets = user.notify.request;
        userRequsets.map(function(userRequest, key) {
            requests.map(function(request) {
                if (request._id === userRequest && request.hasDisposed) {
                    var index = user.notify.request.indexOf(userRequest);
                    user.notify.request.splice(index, 1);
                }
            });
        });
        user.save(cb);
    });
}