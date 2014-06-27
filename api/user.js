var Models = require('../models');
var Job = Models.Job;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Trend = Models.Trend;
var Request = Models.Request;
var Share = Models.Share;
var Group = Models.Group;
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
    req.session.user = null;
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
                    code: 200,
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
        },
        type: 'view'
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
        array.push(user._id.toString());
        followList.map(function(value, key) {
            array.push(value.toString());
        });
        Share.find({
            user: {
                $in: array
            }
        }).sort({
            createAt: -1
        }).populate('user').skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, trends) {
            if (!trends) {
                return res.send({
                    code: 200,
                    info: 'no share'
                });
            }
            Share.find({
                user: {
                    $in: array
                },
                type: 'view'
            }).count().exec(function(err, count) {
                var content = [];
                var hasNext;
                trends.map(function(item, key) {
                    var result = {};
                    result.type = 'view';
                    result._id = item._id;
                    result.comments = item.comments;
                    result.content = item.content;
                    result.createAt = item.createAt.getTime();
                    result.date = item.date;
                    result.id = item.id;
                    result.user = {
                        name: item.user.name,
                        avatar: item.user.avatar,
                        _id: item.user._id,
                        id: item.user.id
                    };
                    result.liked = false;
                    item.likes.map(function(like) {
                        if (like.toString() == user._id.toString()) {
                            result.liked = true;
                        }
                    });
                    result.likes = item.likes.length;
                    content.push(result);
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
        user: userId,
        type: 'view'
    }, function(err, shares) {
        var results = [];
        shares.map(function(share) {
            var result = {
                _id: share._id,
                content: share.content,
                likes: share.likes.length,
                id: share.id,
                comments: share.comments,
                createAt: share.createAt.getTime()
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
    Share.find({
        user: user._id,
        is_delete: false
    }).sort({
        createAt: -1
    }).skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, trends) {
        if (!trends) {
            return res.send({
                code: 200,
                info: 'no active',
                content: []
            });
        }
        Share.find({
            user: user._id
        }).count().exec(function(err, count) {
            var content = [];
            var hasNext;
            trends.map(function(item, key) {
                var result = {};
                if (item.type === 'view') {
                    result.type = 'view';
                    result._id = item._id;
                    result.comments = item.comments;
                    result.content = item.content;
                    result.createAt = item.createAt.getTime();
                    result.id = item.id;
                    result.liked = false;
                    item.likes.map(function(like) {
                        if (like.toString() == user._id) {
                            result.liked = true;
                        }
                    });
                    result.likes = item.likes.length;
                    content.push(result);
                }
                if (item.type === 'job') {
                    result.type = 'job';
                    result._id = item._id;
                    result.comments = item.comments;
                    result.id = item.id;
                    result.createAt = item.createAt.getTime();
                    result.jobType = item.jobType;
                    result.paymentStart = item.paymentStart;
                    result.paymentEnd = item.paymentEnd;
                    result.degree = item.degree;
                    result.position = item.position;
                    result.location = item.location;
                    result.workYears = item.workYears;
                    result.summary = item.summary;
                    result.detail = item.detail;
                    result.liked = false;
                    item.likes.map(function(like) {
                        if (like.toString() == user._id.toString()) {
                            result.liked = true;
                        }
                    });
                    result.likes = item.likes.length;
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
var getCompanyActive = function(req, res) {
    var id = req.query.id;
    var page = req.query.page || 1;
    var perPageItems = 20;
    if (!id) {
        return res.send({
            code: 404
        });
    }
    User.findOne({
        id: id
    }, function(err, user) {
        Share.find({
            user: user._id,
            is_delete: false
        }).sort({
            createAt: -1
        }).skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, trends) {
            if (!trends) {
                return res.send({
                    code: 200,
                    info: 'no active',
                    content: []
                });
            }
            Share.find({
                user: user._id
            }).count().exec(function(err, count) {
                var content = [];
                var hasNext;
                trends.map(function(item, key) {
                    var result = {};
                    if (item.type === 'view') {
                        result.type = 'view';
                        result._id = item._id;
                        result.comments = item.comments;
                        result.content = item.content;
                        result.createAt = item.createAt.getTime();
                        result.id = item.id;
                        result.liked = false;
                        item.likes.map(function(like) {
                            if (like.toString() == user._id) {
                                result.liked = true;
                            }
                        });
                        result.likes = item.likes.length;
                        content.push(result);
                    }
                    if (item.type === 'job') {
                        result.type = 'job';
                        result._id = item._id;
                        result.comments = item.comments;
                        result.id = item.id;
                        result.createAt = item.createAt.getTime();
                        result.type = item.type;
                        result.paymentStart = item.paymentStart;
                        result.paymentEnd = item.paymentEnd;
                        result.degree = item.degree;
                        result.position = item.position;
                        result.location = item.location;
                        result.workYears = item.workYears;
                        result.summary = item.summary;
                        result.detail = item.detail;
                        result.liked = false;
                        item.likes.map(function(like) {
                            if (like.toString() == user._id.toString()) {
                                result.liked = true;
                            }
                        });
                        result.likes = item.likes.length;
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
var companyLike = function(req, res) {
    var user = req.session.user;
    var companyId = req.body.id;
    User.findOne({
        id: companyId
    }, function(err, company) {
        var likes = company.likes;
        var isLiked = false;
        likes.map(function(like) {
            if (like.toString() == user._id) {
                isLiked = true;
            }
        });
        if (isLiked) {
            return res.send({
                code: 200,
                liked: true
            });
        }
        company.likes.push(user._id);
        company.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};
var companyUnlike = function(req, res) {
    var user = req.session.user;
    var companyId = req.body.id;
    User.findOne({
        id: companyId
    }, function(err, company) {
        var likes = company.likes;
        var index = -1;
        likes.map(function(like, key) {
            if (like.toString() == user._id) {
                index = key;
            }
        });
        company.likes.splice(index, 1);
        company.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};
var companyFollow = function(req, res) {
    var user = req.session.user;
    var companyId = req.body.id;
    User.findOne({
        id: companyId
    }, function(err, company) {
        var followers = company.followers;
        var isFolowed = false;
        followers.map(function(follow) {
            if (follow.toString() == user._id) {
                isFolowed = true;
            }
        });
        if (isFolowed) {
            return res.send({
                code: 200
            });
        }
        company.followers.push(user._id);
        company.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};
var companyUnfollow = function(req, res) {
    var user = req.session.user;
    var companyId = req.body.id;
    User.findOne({
        id: companyId
    }, function(err, company) {
        var followers = company.followers;
        var index = -1;
        followers.map(function(follow, key) {
            if (follow.toString() == user._id) {
                index = key;
            }
        });
        company.followers.splice(index, 1);
        company.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};
var getUserCard = function(req, res) {
    var id = req.params.id;
    User.findOne({
        id: id
    }).exec(function(err, user) {
        if (err || !user) {
            return res.send({
                code: 404
            });
        }
        if (user.role === 'user') {
            UserProfile.findOne({
                _id: user.profile
            }, function(err, profile) {
                var connect = {
                    avatar: user.avatar,
                    name: user.name,
                    id: user.id,
                    occupation: user.occupation,
                    skills: (function() {
                        var result = [];
                        profile.skills.map(function(item) {
                            result.push(item);
                        });
                        return result;
                    })()
                };
                res.send({
                    code: 200,
                    content: connect
                });
            });
        } else {
            CompanyProfile.findOne({
                _id: user.profile
            }, function(err, profile) {
                var connect = {
                    avatar: user.avatar,
                    name: user.name,
                    id: user.id,
                    occupation: user.occupation,
                    skills: (function() {
                        var result = [];
                        profile.skills.map(function(item) {
                            result.push(item);
                        });
                        return result;
                    })()
                };
                res.send({
                    code: 200,
                    content: connect
                });
            });
        }
    });
};

var getNotifyCount = function(req, res) {
    var user = req.session.user;
    Request.find({
        to: user._id,
        hasDisposed: false
    }, function(err, requests) {
        var comment = [];
        var reply = [];
        var group = [];
        var connect = [];
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
        });
        res.send({
            code: 200,
            comment: comment.length,
            reply: reply.length,
            group: group.length,
            connect: connect.length
        });
    });
};
var getRequest = function(req, res) {
    var user = req.session.user;
    var op = req.params.op;
    if (['group', 'reply', 'comment', 'connect'].indexOf(op) < 0) {
        return res.send({
            code: 404,
            info: 'invalide operation'
        });
    }
    Request.find({
        to: user._id,
        type: op
    }).populate('from').populate('group').sort('-createAt').exec(function(err, requests) {
        var items = [];
        requests.map(function(request) {
            var result = {};
            result.from = {
                id: request.from.id,
                _id: request.from._id,
                name: request.from.name,
                avatar: request.from.avatar
            };
            result.group = {
                id: request.group && request.group.id,
                _id: request.group && request.group._id,
                avatar: request.group && request.group.avatar,
                name: request.group && request.group.name
            };
            result._id = request._id;
            result.hasDisposed = request.hasDisposed;
            result.isPass = request.isPass;
            result.type = request.type;
            result.content = request.content;
            items.push(result);
        });
        res.send({
            code: 200,
            requests: items
        });
    });
};
var readRequest = function(req, res) {
    var user = req.session.user;
    var op = req.params.op;
    var groupId = req.body.groupId;
    if (['reply', 'comment'].indexOf(op) < 0) {
        return res.send({
            code: 404,
            info: 'invalide operation'
        });
    }
    Request.findOne({
        to: user._id,
        _id: groupId,
        type: op,
        hasDisposed: false
    }, function(err, request) {
        if (!request) {
            return res.send({
                code: 200
            });
        }
        request.hasDisposed = true;
        request.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};

var getConnectList = function(req, res) {
    var user = req.session.user;
    if (!user) {
        return res.send({
            code: 404
        });
    }
    User.findOne({
        _id: user._id
    }).exec(function(err, user) {
        var lists = [];
        user.connects.map(function(item) {
            lists.push(item.user);
        });
        User.find({
            _id: {
                $in: lists
            }
        }).select('name').exec(function(err, users) {
            var userList = [];
            users.map(function(item) {
                userList.push(item.name);
            });
            res.send({
                code: 200,
                userList: userList
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
    app.get('/api/user/myActive', middleware.check_login, getMyActive);
    app.get('/api/user/myShare', middleware.check_login, getMyShare);

    // company profile
    app.post('/api/user/like', middleware.check_login, companyLike);
    app.post('/api/user/unlike', middleware.check_login, companyUnlike);
    app.post('/api/user/follow', middleware.check_login, companyFollow);
    app.post('/api/user/unfollow', middleware.check_login, companyUnfollow);
    app.get('/api/user/companyActive', getCompanyActive);

    // notify
    app.get('/api/notify', getNotifyCount);
    app.get('/api/notify/:op', getRequest);
    app.post('/api/notify/:op/read', readRequest);

    // connect
    app.post('/api/connect/send', sendNotify);
    app.post('/api/connect/check', checkConnect);
    app.post('/api/connect/disconnect', disconnect);
    app.get('/api/connects', getConnects);

    // message
    app.post('/api/message/send', sendMessage);
    app.post('/api/message/read', readMessage);

    // user operation
    app.get('/api/user/:id/card', getUserCard);
    app.get('/api/user/userList', getConnectList);
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