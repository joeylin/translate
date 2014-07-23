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
var moment = require('moment');
var email = require('../lib/email');

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
            stage: user.registerStage
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
    var connectId = req.body.connectId;
    User.findOne({
        _id: user._id
    }, function(err, user) {
        user.disconnect(connectId, function(err, user) {
            if (!user) {
                return res.send({
                    code: 404,
                    info: 'you are not friend'
                });
            }
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
var getFollowGroupUpdate = function(req, res) {
    var user = req.session.user;
    var page = req.params.page || 0;
    var perPageItems = 20;

    User.findOne({
        _id: user._id
    }).exec(function(err, user) {
        var follows = user.groups.join.concat(user.groups.follow);
        var query = {
            group: {
                $in: follows
            },
            type: 'view',
            is_delete: false
        };
        Share.find(query).populate('group').populate('user').sort('-createAt').skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, shares) {
            Share.find(query).count().exec(function(err,count) {
                var content = [];
                var hasNext;
                shares.map(function(item, key) {
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
var getTrends = function(req, res) {
    var user = req.session.user;
    var page = req.query.page || 1;
    var perPageItems = 30;
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
            },
            type: 'view',
            is_delete: false
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
                type: 'view',
                is_delete: false
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
    var user = req.session.user;
    var perPageItems = 30;
    var page = req.query.page || 1;
    User.findOne({
        _id: user._id
    }).populate('connects.user').exec(function(err, user) {
        var results = [];
        var hasNext = false;
        user.connects.map(function(connect) {
            var result = {
                _id: connect.user._id,
                name: connect.user.name,
                id: connect.user.id,
                avatar: connect.user.avatar,
                relate: connect.relate,
                occupation: connect.user.occupation,
                signature: connect.user.signature,
                connects: connect.user.connects.length
            };
            results.push(result);
        });
        res.send({
            code: 200,
            content: results,
            hasNext: (results.length - page * perPageItems) > 0 ? true : false
        });

    });
};
var myConnnectsNameQuery = function(req, res) {
    var user = req.session.user;
    var name = req.query.name;
    var page = req.query.page || 1;
    var search = req.query.search || false;
    var perPageItems = 30;
    User.findOne({
        _id: user._id
    }).populate('connects.user').exec(function(err, user) {
        var connects = user.connects;
        var array = [];
        connects.map(function(item) {
            if (item.user.name.match('')) {
                if (search) {
                    array.push({
                        _id: item.user._id,
                        name: item.user.name,
                        id: item.user.id,
                        avatar: item.user.avatar,
                        relate: item.relate,
                        occupation: item.user.occupation,
                        signature: item.user.signature,
                        connects: item.user.connects.length
                    });
                } else {
                    array.push(item.user.name);
                }
            }
        });
        res.send({
            code: 200,
            content: array.slice((page - 1) * perPageItems, perPageItems),
            hasNext: (array.length - page * perPageItems) > 0 ? true : false
        });
    });
};
var myConnectsByClassify = function(req, res) {
    var user = req.session.user;
    var classify = req.query.classify || false;
    var name = req.query.name;
    var page = req.query.page || 1;
    var perPageItems = 30;

    if (!classify) {
        var count = {
            fellow: 0,
            friend: 0,
            classmate: 0,
            interest: 0
        };
        User.findOne({
            _id: user._id
        }, function(err, user) {
            var connects = user.connects;
            connects.map(function(item) {
                if (item.relate.split(',').indexOf('fellow')) {
                    count.fellow += 1;
                }
                if (item.relate.split(',').indexOf('friend')) {
                    count.friend += 1;
                }
                if (item.relate.split(',').indexOf('classmate')) {
                    count.classmate += 1;
                }
                if (item.relate.split(',').indexOf('interest')) {
                    count.interest += 1;
                }
            });
            res.send({
                code: 200,
                count: count
            });
        });
    } else if (classify === 'r') {
        if (!name) {
            return res.send({
                code: 200,
                content: [],
                hasNext: false
            });
        }
        var relates = [];
        User.findOne({
            _id: user._id
        }).populate('connects.user').exec(function(err, user) {
            var connects = user.connects;
            connects.map(function(item) {
                if (item.relate.split(',').indexOf(name)) {
                    relates.push({
                        _id: item.user._id,
                        name: item.user.name,
                        id: item.user.id,
                        avatar: item.user.avatar,
                        relate: item.relate,
                        occupation: item.user.occupation,
                        signature: item.user.signature,
                        connects: item.user.connects.length
                    });
                }
            });
            res.send({
                code: 200,
                content: relates.slice((page - 1) * perPageItems, perPageItems),
                hasNext: (relates.length - page * perPageItems) > 0 ? true : false
            });
        });
    } else if (classify === 'o') {
        if (!name) {
            return res.send({
                code: 200,
                content: [],
                hasNext: false
            });
        }
        var occupation = [];
        // todo
    }
};
var getMyShare = function(req, res) {
    var user = req.session.user;
    var page = req.query.page || 1;
    var perPageItems = 30;
    Share.find({
        user: user._id,
        type: 'view',
        is_delete: false
    }).sort('-createAt').skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, shares) {
        Share.find({
            user: user._id,
            type: 'view',
            is_delete: false
        }).count().exec(function(err, count) {
            var content = [];
            var hasNext;
            shares.map(function(item, key) {
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
};
var myShareSearch = function(req, res) {
    var user = req.session.user;
    var keyword = req.query.keyword;
    var page = req.query.page || 1;
    var perPageItems = 30;
    var re = new RegExp(keyword, 'ig');
    Share.find({
        user: user._id,
        content: re,
        type: 'view',
        is_delete: false
    }).skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, shares) {
        Share.find({
            user: user._id,
            content: re,
            type: 'view',
            is_delete: false
        }).count().exec(function(err, count) {
            var content = [];
            var hasNext;
            shares.map(function(item, key) {
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
            var connect = {
                avatar: user.avatar,
                name: user.name,
                id: user.id,
                occupation: user.occupation
            };
            res.send({
                code: 200,
                content: connect
            });
        } else {
            var connect = {
                avatar: user.avatar,
                name: user.name,
                id: user.id,
                occupation: user.occupation
            };
            res.send({
                code: 200,
                content: connect
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
        res.send({
            code: 200,
            comment: comment.length,
            reply: reply.length,
            group: group.length,
            connect: connect.length,
            at: at.length
        });
    });
};
var getRequest = function(req, res) {
    var user = req.session.user;
    var op = req.params.op;
    if (['group', 'reply', 'comment', 'connect', 'all'].indexOf(op) < 0) {
        return res.send({
            code: 404,
            info: 'invalide operation'
        });
    }
    if (op === 'all') {
        Request.find({
            to: user._id,
            hasDisposed: false
        }).populate('from').populate('group').sort('-createAt').limit(20).exec(function(err, requests) {
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
    } else {
        Request.find({
            to: user._id,
            type: op
        }).populate('from').populate('group').sort('-createAt').limit(20).exec(function(err, requests) {
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
    }
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
var getGroupByUser = function(req, res) {
    var user = req.session.user;
    User.findOne({
        _id: user._id
    }).populate('groups.join').exec(function(err, user) {
        var joinGroups = user.groups.join;
        var results = [];
        joinGroups.map(function(group, key) {
            var result = {
                avatar: group.avatar,
                id: group.id,
                _id: group._id,
                industry: group.industry,
                name: group.name,
                count: group.count,
                total: 100,
                update: 9
            };
            results.push(result);
        });
        res.send({
            code: 200,
            content: results
        });
    });
};
var changeRelate = function(req, res) {
    var user = req.session.user;
    var content = req.body.content;
    var userId = req.body.userId;

    if (content === '') {
        return res.send({
            code: 404,
            info: 'relate cant be blank'
        });
    }
    User.findOne({
        _id: user._id
    }, function(err, user) {
        var connects = user.connects;
        connects.map(function(item) {
            if (item.user.toString() == userId) {
                item.relate = content;
            }
        });
        // user.markModified('connects.relate');
        user.save(function() {
            res.send({
                code: 200
            });
        });
    });
};

var getMyJob = function(req, res) {
    var user = req.session.user;
    var status = req.query.status;
    var page = req.query.page || 1;
    var perPageItems = 30;

    Share.find({
        user: user._id,
        type: 'job',
        is_delete: false,
        status: status || {
            $in: ['publish', 'close', 'draft']
        }
    }).sort('-createAt').skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, shares) {
        Share.find({
            user: user._id,
            type: 'job',
            is_delete: false,
            status: status || {
                $in: ['publish', 'close', 'draft']
            }
        }).count().exec(function(err, count) {
            var results = [];
            var hasNext;
            shares.map(function(item) {
                var obj = {
                    _id: item._id,
                    id: item.id,
                    summary: item.summary,
                    position: item.position,
                    paymentStart: item.paymentStart,
                    paymentEnd: item.paymentEnd,
                    workYears: item.workYears,
                    number: item.number,
                    skills: item.skills,
                    location: item.location,
                    degree: item.degree,
                    views: item.views,
                    join: item.resumes.length,
                    type: item.jobType,
                    date: item.createAt.getTime(),
                    status: item.status,
                    isSaved: false
                };
                results.push(obj);
            });
            if ((page - 1) * perPageItems + results.length < count) {
                hasNext = true;
            } else {
                hasNext = false;
            }
            res.send({
                code: 200,
                content: results,
                count: count,
                hasNext: hasNext
            });
        });
    });
};

var getMayKnowConnects = function(req, res) {
    var user = req.session.user;
    var page = req.query.page || 1;
    var perPageItems = 30;

    User.findOne({
        _id: user._id
    }, function(err, user) {
        var array = [];
        var query = {
            role: 'user'
        };
        user.connects.map(function(item) {
            array.push(item.user.toString());
        });
        array.push(user._id.toString());

        query._id = {
            $nin: array
        };
        query.$or = [{
            company: user.company
        }, {
            school: user.school
        }];

        User.find(query).skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, users) {
            User.find(query).count().exec(function(err, count) {
                var results = [];
                var hasNext;
                users.map(function(item) {
                    var obj = {
                        id: item.id,
                        _id: item._id,
                        name: item.name,
                        avatar: item.avatar,
                        school: item.school,
                        company: item.company,
                        connects: item.connects.length,
                        occupation: item.occupation
                    };
                    results.push(obj);
                });
                if ((page - 1) * perPageItems + results.length < count) {
                    hasNext = true;
                } else {
                    hasNext = false;
                }
                res.send({
                    code: 200,
                    content: results,
                    count: count,
                    hasNext: hasNext
                });
            });
        });
    });
};
var searchById = function(req, res) {
    var id = req.query.id;
    User.findOne({
        id: id
    }).exec(function(err, user) {
        if (!user) {
            return res.send({
                code: 200,
                info: 'no user'
            });
        }
        var result = {
            avatar: user.avatar,
            id: user.id,
            _id: user._id,
            name: user.name,
            school: user.school,
            company: user.company,
            connects: user.connects.length,
            occupation: user.occupation
        };
        res.send({
            code: 200,
            user: [result]
        });
    });
};

var getMysending = function(req, res) {
    var user = req.session.user;
    var page = req.query.page || 1;
    var perPageItems = 30;
    var query = {
        type: 'job',
        is_delete: false,
        'resumes.user': user._id
    };
    Share.find(query).populate('user').sort('-resumes.date').skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, shares) {
        Share.find(query).count().exec(function(err, count) {
            var results = [];
            var hasNext;
            shares.map(function(item) {
                var obj = {
                    owner: {
                        avatar: item.user.avatar,
                        name: item.user.name,
                        id: item.user.id,
                        _id: item.user._id
                    },
                    _id: item._id,
                    id: item.id,
                    summary: item.summary,
                    position: item.position,
                    paymentStart: item.paymentStart,
                    paymentEnd: item.paymentEnd,
                    workYears: item.workYears,
                    number: item.number,
                    skills: item.skills,
                    location: item.location,
                    degree: item.degree,
                    views: item.views,
                    join: item.resumes.length,
                    type: item.jobType,
                    date: item.createAt.getTime()
                };
                if (item.status == 'close') {
                    obj.status = 'close';
                }
                results.push(obj);
            });
            if ((page - 1) * perPageItems + results.length < count) {
                hasNext = true;
            } else {
                hasNext = false;
            }

            res.send({
                code: 200,
                count: count,
                content: results,
                hasNext: hasNext
            });
        });
    });
};
var getJobRecommend = function(req, res) {
    var user = req.session.user;
    var query = {
        type: 'job',
        status: 'publish',
        is_delete: false
    };
    Share.find(query).populate('user').sort('-createAt').limit(6).exec(function(err, shares) {
        var results = [];
        shares.map(function(item) {
            var obj = {
                owner: {
                    avatar: item.user.avatar,
                    name: item.user.name,
                    id: item.user.id,
                    _id: item.user._id
                },
                position: item.position,
                _id: item._id,
                id: item.id,
                paymentStart: item.paymentStart,
                paymentEnd: item.paymentEnd,
                location: item.location
            };
            results.push(obj);
        });
        res.send({
            code: 200,
            content: results
        });
    });
};

var setUserBasic = function(req, res) {
    var user = req.session.user;
    var school = req.body.school;
    var company = req.body.company;
    var occupation = req.body.occupation;
    var workYear = req.body.workYear;
    var location = req.body.location;
    var schoolStart = req.body.schoolStart;
    var schoolEnd = req.body.schoolEnd;
    var isFreelance = req.body.isFreelance;
    var professional = req.body.professional;

    if (professional && (!workYear || !location || !occupation || (!isFreelance && !company))) {
        return res.send({
            code: 404,
            info: 'professional info incomplete'
        });
    }
    if (!professional && (!school || !location || !occupation || !schoolStart || !schoolEnd)) {
        return res.send({
            code: 404,
            info: 'student info incomplete'
        });
    }
    User.findOne({
        _id: user._id
    }, function(err, user) {
        user.company = company;
        user.occupation = occupation;
        user.workYear = workYear;
        user.school = school;
        user.isStudent = !professional;
        user.isFreelance = isFreelance;
        user.schoolStart = schoolStart;
        user.schoolEnd = schoolEnd;
        user.location = location;
        user.registerStage = 2;

        user.emailActiveCode.code = randomString();
        user.emailActiveCode.date = new Date();

        user.save(function(err) {
            email(user);
            res.send({
                code: 200,
                stage: 2
            });
        });
    });
};

var reSendActiveCode = function(req, res) {
    var user = req.session.user;
    User.findOne({
        _id: user._id
    }, function(err, user) {
        if (!user.emailActiveCode.code) {
            user.emailActiveCode.code = randomString();
            user.emailActiveCode.date = new date();
            user.emailActiveCode.count += 1;
            user.save(function(err) {
                email(user);
                res.send({
                    code: 200,
                    info: 'send success'
                });
            });
        } else {
            if (user.emailActiveCode.count >= 10) {
                return res.send({
                    code: 200,
                    info: 'send too many'
                });
            }
            var a = moment(new Date());
            var b = moment(user.emailActiveCode.date);
            if (a.diff(b) < 60) {
                return res.send({
                    code: 200,
                    info: 'too frequency'
                });
            }
            email(user);
        }
    });
};

var userSkillsAdd = function(req, res) {
    var user = req.session.user;
    var name = req.body.name;
    User.findOne({
        _id: user._id
    }, function(err, user) {
        var index = -1;
        user.skills.map(function(item, key) {
            if (item.name == name) {
                index = key;
                return false;
            }
        });
        if (index > -1) {
            return res.send({
                code: 404,
                info: 'repeat skill'
            });
        }
        var skill = {
            name: name,
            vote: []
        };
        user.skills.push(skill);
        user.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};
var userSkillsRemove = function(req, res) {
    var user = req.session.user;
    var index = req.body.index;

    User.findOne({
        _id: user._id
    }, function(err, user) {
        user.skills.splice(index, 1);
        user.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};
var userSkillsVote = function(req, res) {
    var user = req.session.user;
};

module.exports = function(app) {
    app.post('/api/user/register', create);
    app.post('/api/user/login', login);
    app.post('/api/user/logout', logout);
    app.post('/api/user/userbasic', middleware.apiLogin, setUserBasic);
    app.post('/api/user/acitveResend', middleware.apiLogin, reSendActiveCode);

    // trends
    app.get('/api/user/share', middleware.check_login, getShare);
    app.get('/api/user/trend', middleware.check_login, getTrends);
    app.get('/api/user/myActive', middleware.check_login, getMyActive);
    app.get('/api/user/myShare', middleware.check_login, getMyShare);
    app.get('/api/user/myShare/search', middleware.check_login, myShareSearch);
    app.get('/api/user/myjob', middleware.check_login, getMyJob);
    app.get('/api/user/mayknow', middleware.check_login, getMayKnowConnects);
    app.get('/api/user/id', middleware.check_login, searchById);
    app.get('/api/user/sending', middleware.check_login, getMysending);
    app.get('/api/user/jobrecommend', middleware.check_login, getJobRecommend);

    // company profile
    app.post('/api/user/like', middleware.check_login, companyLike);
    app.post('/api/user/unlike', middleware.check_login, companyUnlike);
    app.post('/api/user/follow', middleware.check_login, companyFollow);
    app.post('/api/user/unfollow', middleware.check_login, companyUnfollow);
    app.get('/api/user/companyActive', getCompanyActive);

    // skills
    app.post('/api/user/skills/add', middleware.apiLogin, userSkillsAdd);
    app.post('/api/user/skills/remove', middleware.apiLogin, userSkillsRemove);
    app.post('/api/user/skills/vote', middleware.apiLogin, userSkillsVote);

    // notify
    app.get('/api/notify', middleware.check_login, getNotifyCount);
    app.get('/api/notify/:op', middleware.check_login, getRequest);
    app.post('/api/notify/:op/read', middleware.check_login, readRequest);

    // Group
    app.get('/api/myGroup', middleware.check_login, getGroupByUser);
    app.get('/api/groupUpdate',middleware.check_login, getFollowGroupUpdate);

    // connect
    app.post('/api/connect/send', middleware.check_login, sendNotify);
    app.post('/api/connect/check', middleware.check_login, checkConnect);
    app.post('/api/connect/disconnect', middleware.check_login, disconnect);
    app.post('/api/connect/relate', middleware.check_login, changeRelate);
    app.get('/api/connects', middleware.check_login, getConnects);
    app.get('/api/myConnects/name', middleware.check_login, myConnnectsNameQuery);
    app.get('/api/myConnects/classify', middleware.check_login, myConnectsByClassify);

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

function randomString(size) {
    size = size || 6;
    var code_string = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var max_num = code_string.length + 1;
    var new_pass = '';
    while (size > 0) {
        new_pass += code_string.charAt(Math.floor(Math.random() * max_num));
        size--;
    }
    return new_pass;
}