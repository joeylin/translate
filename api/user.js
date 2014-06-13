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
        res.send({
            code: 200,
            info: 'request has sent'
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

                    if (err) {
                        res.send({
                            code: 404,
                            info: 'fail connect'
                        });
                    }
                    request.dispose(true, function(err) {
                        console.log(value)
                        if (err) {
                            console.log(err);
                        }
                        res.send({
                            code: 200,
                            info: 'check true'
                        });
                    });
                });
            } else {
                request.dispose(false, function(err) {
                    if (err) {
                        console.log(err);
                    }
                    res.send({
                        code: 200,
                        info: 'check false'
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
    Request.find({
        to: user._id,
        hasDisposed: false
    }, function(err, request) {
        res.send({
            code: 200,
            notify: {
                request: request.length,
                message: 0
            }
        });
    });
};
var getRequest = function(req, res) {
    var user = req.session.user;
    Request.find({
        to: user._id
    }).populate('from').exec(function(err, requests) {
        console.log(requests);
        res.send({
            code: 200,
            requests: requests
        });
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
    var page = req.query.page || 1;
    var perPageItems = 20;
    User.findOne({
        _id: user._id
    }, function(err, user) {
        var connectList = [];
        user.connects.map(function(value, key) {
            connectList.push(value.user);
        });
        var followList = connectList.concat(user.followers);
        var array = [];
        followList.map(function(value, key) {
            array.push(value.toString());
        });
        Trend.find({
            userId: {
                $in: array
            }
        }).sort({
            createAt: -1
        }).populate('share').populate('job').populate('userId').skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, trends) {
            Trend.find({
                userId: {
                    $in: array
                }
            }).count().exec(function(err, count) {
                var content = [];
                var hasNext;
                trends.map(function(item, key) {
                    var result = {};
                    if (item.name === 'Share') {
                        result.name = 'share';
                        result._id = item.share._id;
                        result.comments = item.share.comments;
                        result.content = item.share.content;
                        result.createAt = item.share.createAt.toLocaleDateString();
                        result.id = item.share.id;
                        result.user = {
                            name: item.userId.name,
                            avatar: item.userId.avatar,
                            id: item.userId.id
                        };
                        result.liked = false;
                        item.share.likes.map(function(like) {
                            if (like.toString() == user._id.toString()) {
                                result.liked = true;
                            }
                        });
                        result.likes = item.share.likes.length;
                        content.push(result);
                    } else {
                        // todo later
                        result.name = 'job';
                        for (var i in item.job) {
                            result[i] = item.job[i];
                        }
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
var getConnects = function(req, res) {
    var userId = req.query.userId;
    User.findOne({
        _id: userId
    }).populate('connects').exec(function(err, user) {
        var results = [];
        user.connects.map(function(connect) {
            var result = {
                _id: connect._id,
                name: connect.name,
                id: connect.id,
                avatar: connect.avatar
            };
            results.push(result);
        });
        res.send({
            code: 200,
            content: results
        });
    });
};
var getMyShare = function(req, res) {
    var userId = req.query.userId;
    Share.find({
        user: userId
    }, function(err, shares) {
        var results = [];
        shares.map(function(share) {
            var result = {
                _id: share._id,
                content: share.content,
                likes: share.likes.length,
                id: share.id,
                comments: share.comments.length,
                createAt: share.createAt.toLocaleDateString()
            };
            results.push(result);
        });
        res.send({
            code: 200,
            content: results
        });
    });
};
var getMyFollow = function(req, res) {
    var userId = req.query.userId;
    User.findOne({
        _id: userId
    }).populate('followers').exec(function(err, user) {
        var results = [];
        user.followers.map(function(follower) {
            var result = {
                id: follower.id,
                _id: follower._id,
                avatar: follower.avatar,
                name: follower.name,
                phase: follower.phase,
                industry: follower.industry,
                scale: follower.scale,
                location: follower.location
            };
            results.push(result);
        });
        res.send({
            code: 200,
            content: resultes
        });
    });
};
var getMyActive = function(req, res) {
    var user = req.session.user;
    var page = req.query.page || 1;
    var perPageItems = 20;
    Trend.find({
        userId: user._id
    }).sort({
        createAt: -1
    }).populate('share').populate('job').skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, trends) {
        Trend.find({
            userId: user._id
        }).count().exec(function(err, count) {
            var content = [];
            var hasNext;
            trends.map(function(item, key) {
                var result = {};
                if (item.name === 'Share') {
                    result.name = 'share';
                    result._id = item.share._id;
                    result.comments = item.share.comments;
                    result.content = item.share.content;
                    result.createAt = item.share.createAt.toLocaleDateString();
                    result.id = item.share.id;
                    result.liked = false;
                    item.share.likes.map(function(like) {
                        if (like.toString() == user._id.toString()) {
                            result.liked = true;
                        }
                    });
                    result.likes = item.share.likes.length;
                    content.push(result);
                } else {
                    // todo later
                    result.name = 'job';
                    result._id = item.job._id;
                    result.comments = item.job.comments;
                    result.id = item.job.id;
                    result.createAt = item.share.createAt.toLocaleDateString();
                    result.type = item.job.type;
                    result.paymentStart = item.job.paymentStart;
                    result.paymentEnd = item.job.paymentEnd;
                    result.degree = item.job.degree;
                    result.position = item.job.position;
                    result.workYears = item.job.workYears;
                    result.summary = item.job.summary;
                    result.detail = item.job.detail;
                    result.liked = false;
                    item.job.likes.map(function(like) {
                        if (like.toString() == user._id.toString()) {
                            result.liked = true;
                        }
                    });
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
};

module.exports = function(app) {
    app.post('/api/user/register', create);
    app.post('/api/user/login', login);
    app.post('/api/user/logout', logout);

    // trends
    app.get('/api/user/share', middleware.check_login, getShare);
    app.get('/api/user/trend', middleware.check_login, getTrends);
    app.get('/api/user/myShare', middleware.check_login, getMyShare);

    // notify
    app.get('/api/notify', getNotify);
    app.get('/api/notify/request', getRequest);
    // app.post('/api/notify/read', readRequest);

    // connect
    app.post('/api/connect/send', sendNotify);
    app.post('/api/connect/check', checkConnect);
    app.post('/api/connect/disconnect', disconnect);
    app.get('/api/connects', getConnects);

    // message
    app.post('/api/message/send', sendMessage);
    app.post('/api/message/read', readMessage);
};

// check request status
function checkUserRequest(requests, userId, cb) {
    User.findOne({
        _id: userId
    }).exec(function(err, user) {
        requests.map(function(request) {

        });
    });
}

function checkSameTypeRequest(userId, requests, cb) {
    async.eachSeries(requests, function(request, next) {
        if (request.from === userId) {
            Request.findOne({
                _id: request._id
            }, function(err, request) {
                request.hasDisposed = true;
                request.isPass = true;
                request.save(function(err) {
                    next();
                });
            });
        } else {
            next();
        }
    }, function(err) {
        cb(err);
    });
}