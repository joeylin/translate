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
var Invitation = Models.Invitation;
var Feedback = Models.Feedback;

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
    var code = req.body.code;

    Invitation.findOne({
        code: code
    }).exec(function(err, invitation) {
        if (!invitation) {
            return res.send({
                code: 404,
                info: '邀请码无效'
            });
        }
        if (invitation.is_delete) {
            return res.send({
                code: 404,
                info: '邀请码已使用过'
            });
        }
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
                    invitation.is_delete = true;
                    invitation.save(function(err, invitation) {
                        res.send({
                            code: 200,
                            user: req.session.user
                        });
                    }); 
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
            console.log(err);
            return false;
        }
        if (!user) {
            return res.send({
                code: 200,
                info: '该邮箱尚未注册'
            });
        }
        if (!user.authenticate(password)) {
            return res.send({
                code: 200,
                info: '密码错误'
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
                        var obj = {
                            title: 'connect',
                            to: request.from
                        };
                        Request.notice(obj);
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
        }).populate('user').populate('from.share')
        .populate('from.user').populate('from.group')
        .skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, trends) {
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
                    result.commentsCount = item.comments.length;
                    result.content = item.content;
                    result.createAt = item.createAt.getTime();
                    result.date = item.date;
                    result.id = item.id;
                    result.fork = item.fork;
                    result.user = {
                        name: item.user.name,
                        avatar: item.user.avatar,
                        _id: item.user._id,
                        id: item.user.id
                    };
                    result.isFork = item.isFork;
                    if (item.isFork) {
                        result.from = {
                            user: {
                                name: item.from.user.name,
                                id: item.from.user.id,
                                _id: item.from.user._id
                            },
                            share: {
                                createAt: item.from.share.createAt,
                                content: item.from.share.content,
                                _id: item.from.share._id
                            }
                        };
                        if (item.from.group) {
                            result.from.group = {
                                name: item.from.group.name,
                                id: item.from.group.id,
                                _id: item.from.group._id
                            };
                        }
                    }
                    result.has_collect = false;
                    if (user) {
                        item.collects.map(function(collect) {
                            if (collect.user.toString() == user._id.toString()) {
                                result.has_collect = true;
                            }
                        });
                    }
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

                // get groupTrends update count
                var follow = [];
                user.groups.follow.map(function(item) {
                    follow.push(item.toString());
                });
                var groupQuery = {
                    group: {
                        '$in': follow
                    },
                    is_delete: false,
                    createAt: {
                        '$gt': Date.now() - user.visit.groupTrends.getTime() >= 10 * 60 * 1000 ?  user.visit.groupTrends : Date.now()
                    }
                };
                Share.find(groupQuery).count().exec(function(err, groupUpdate) {
                    res.send({
                        code: 200,
                        count: count,
                        groupUpdate: groupUpdate,
                        hasNext: hasNext,
                        content: content
                    });   
                });                                     
            });
        });
    });
};
var getConnects = function(req, res) {
    var user = req.session.user;
    var perPageItems = 20;
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
                location: connect.user.location,
                avatar: connect.user.avatar,
                relate: connect.relate,
                occupation: connect.user.occupation
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
    }).populate('from.share').populate('from.user').populate('from.group')
    .sort('-createAt').skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, shares) {
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
                result.commentsCount = item.comments.length;
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
                result.isFork = item.isFork;
                if (item.isFork) {
                    result.from = {
                        user: {
                            name: item.from.user.name,
                            id: item.from.user.id,
                            _id: item.from.user._id
                        },
                        share: {
                            createAt: item.from.share.createAt,
                            content: item.from.share.content,
                            _id: item.from.share._id
                        }
                    };
                    if (item.from.group) {
                        result.from.group = {
                            name: item.from.group.name,
                            id: item.from.group.id,
                            _id: item.from.group._id
                        };
                    }
                }
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
    var query = {
        user: user._id,
        content: re,
        type: 'view',
        is_delete: false
    }
    Share.find(query).populate('from.share').populate('from.user').populate('from.group')
    .sort('-createAt').skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, shares) {
        Share.find(query).count().exec(function(err, count) {
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
                result.isFork = item.isFork;
                if (item.isFork) {
                    result.from = {
                        user: {
                            name: item.from.user.name,
                            id: item.from.user.id,
                            _id: item.from.user._id
                        },
                        share: {
                            createAt: item.from.share.createAt,
                            content: item.from.share.content,
                            _id: item.from.share._id
                        }
                    };
                    if (item.from.group) {
                        result.from.group = {
                            name: item.from.group.name,
                            id: item.from.group.id,
                            _id: item.from.group._id
                        };
                    }
                }
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
var getMyCollect = function(req, res) {
    var user = req.session.user;
    var page = req.query.page || 1;
    var perPageItems = 30;
    var query = {
        'collects.user': user._id,
        is_delete: false
    };
    Share.find(query).populate('group').populate('user')
    .populate('from.share').populate('from.user').populate('from.group')
    .sort('collects.date').skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, shares) {
        Share.find(query).count().exec(function(err, count) {
            var content = [];
            var hasNext;
            shares.map(function(item, key) {
                var result = {};
                result.type = 'view';
                result._id = item._id;
                result.commentsCount = item.comments.length;
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
                if (item.group) {
                    result.group = {
                        name: item.group.name,
                        id: item.group.id,
                        _id: item.group._id,
                        avatar: item.group.avatar
                    };
                }
                result.isFork = item.isFork;
                if (item.isFork) {
                    result.from = {
                        user: {
                            name: item.from.user.name,
                            id: item.from.user.id,
                            _id: item.from.user._id
                        },
                        share: {
                            createAt: item.from.share.createAt,
                            content: item.from.share.content,
                            _id: item.from.share._id
                        }
                    };
                    if (item.from.group) {
                        result.from.group = {
                            name: item.from.group.name,
                            id: item.from.group.id,
                            _id: item.from.group._id
                        };
                    }
                }
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
                Next = true;
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
var myCollectSearch = function(req, res) {
    var user = req.session.user;
    var keyword = req.query.keyword;
    var page = req.query.page || 1;
    var perPageItems = 30;
    var re = new RegExp(keyword, 'ig');
    var query = {
        'collects.user': user._id,
        is_delete: false,
        content: re
    };
    Share.find(query).populate('group').populate('user')
    .populate('from.share').populate('from.user').populate('from.group')
    .sort('collects.date').skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, shares) {
        Share.find(query).count().exec(function(err, count) {
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
                result.isFork = item.isFork;
                if (item.isFork) {
                    result.from = {
                        user: {
                            name: item.from.user.name,
                            id: item.from.user.id,
                            _id: item.from.user._id
                        },
                        share: {
                            createAt: item.from.share.createAt,
                            content: item.from.share.content,
                            _id: item.from.share._id
                        }
                    };
                    if (item.from.group) {
                        result.from.group = {
                            name: item.from.group.name,
                            id: item.from.group.id,
                            _id: item.from.group._id
                        };
                    }
                }
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
        hasDisposed: false,
        is_delete: false
    }, function(err, requests) {
        var comment = [];
        var reply = [];
        var group = [];
        var connect = [];
        var at = [];
        var info = [];
        requests.map(function(request) {
            if (request.type === 'group') {
                group.push(request);
            }
            if (request.type === 'connect') {
                connect.push(request);
            }
            if (request.type === 'comment') {
                comment.push(request);
            }
            if (request.type === 'at') {
                at.push(request);
            }
            if (request.type === 'notice') {
                info.push(request);
            }
        });
        res.send({
            code: 200, 
            group: group.length,
            connect: connect.length,
            comment: comment.length,
            at: at.length,
            info: info.length
        });
    });
};
var getRequest = function(req, res) {
    var user = req.session.user;
    var page = req.query.page || 1;
    var perPageItems = 30;
    var op = req.params.op;
    var query = {};
    if (['group', 'reply', 'comment', 'connect', 'all'].indexOf(op) < 0) {
        return res.send({
            code: 404,
            info: 'invalide operation'
        });
    }
    if (op === 'all') {
        query = {
            to: user._id,
            type: {
                $in: ['connect','group']
            },
            hasDisposed: false
        };
        Request.find(query).populate('from').populate('group').sort('-createAt')
        .skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, requests) {
            Request.find(query).count().exec(function(err, count) {
                var items = [];
                var hasNext;
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
                if ((page - 1) * perPageItems + requests.length < count) {
                    hasNext = true;
                } else {
                    hasNext = false;
                }
                res.send({
                    code: 200,
                    requests: items,
                    count: count,
                    hasNext: hasNext
                });
            });        
        });
    } else {
        query = {
            to: user._id,
            type: op
        };
        Request.find(query).populate('from').populate('group')
        .sort('-createAt')
        .skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, requests) {
            Request.find(query).count().exec(function(err, count) {
                var items = [];
                var hasNext;
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
                    result.date = request.createAt.getTime();
                    result.type = request.type;
                    result.content = request.content;
                    items.push(result);
                });
                if ((page - 1) * perPageItems + requests.length < count) {
                    hasNext = true;
                } else {
                    hasNext = false;
                }
                res.send({
                    code: 200,
                    requests: items,
                    count: count,
                    hasNext: hasNext
                });
            });              
        });  
    }
};
var getCommentMe = function(req, res) {
    var user = req.session.user;
    var page = req.query.page || 1;
    var perPageItems = 30;
    var query = {
        replyTo: user._id,
        is_delete: false
    };
    Comment.find(query)
    .populate('user').populate('shareId')
    .populate('replyTo').populate('replyComment')
    .skip((page - 1) * perPageItems).limit(perPageItems)
    .sort('-createAt').exec(function(err, comments) {
        Comment.find(query).count().exec(function(err, count) {
            var items = [];
            var hasNext;
            comments.map(function(comment, key) {
                var result = {};
                if (!comment.shareId || !comment.user) {
                    console.log(comment);
                    return false;
                }
                if (comment.shareId.user.toString() == user._id) {
                    result.myShare = true;
                } else {
                    result.myShare = false;
                }
                result.share = {
                    id: comment.shareId.id,
                    _id: comment.shareId._id
                };
                if (comment.replyComment) {
                    result.replyComment = true;
                    result.comment = {
                        id: comment.replyComment.id,
                        _id: comment.replyComment._id,
                        content: comment.replyComment.content.slice(0,20)
                    }
                } else {
                    result.replyComment = false;
                    result.share.content = comment.shareId.content.slice(0,20);
                }
                result.from = {
                    name: comment.user.name,
                    id: comment.user.id,
                    _id: comment.user._id,
                    avatar: comment.user.avatar
                };
                result.content = comment.content;
                result._id = comment._id;
                result.date = comment.createAt.getTime();
                items.push(result);
            });

            if ((page - 1) * perPageItems + comments.length < count) {
                hasNext = true;
            } else {
                hasNext = false;
            }
            res.send({
                code: 200,
                requests: items,
                count: count,
                hasNext: hasNext
            });
            Request.find({
                to: user._id,
                type: 'comment',
                is_delete: false
            }).exec(function(err, requests) {
                if (err || !requests) {
                    return false;
                }
                requests.map(function(request,key) {
                    request.is_delete = true;
                    request.save(function(err,request) {
                        console.log('read comment msg : ' + request.is_delete);
                    });
                })
            });
        });
    });
};
var getAtShare = function(req, res) {
    var user = req.session.user;
    var page = req.query.page || 1;
    var perPageItems = 30;
    var query = {
        to: user._id,
        type: 'at'
    };
    Request.find(query).exec(function(err, requests) {
        Request.find(query).count().exec(function(err, count) {
            var shareList = [];
            var hasNext;
            requests.map(function(item, key) {
                shareList.push(item.shareId.toString());
            });
            if (shareList.length === 0) {
                return res.send({
                    code: 200,
                    requests: [],
                    count: 0,
                    hasNext: false
                });
            }
            if ((page - 1) * perPageItems + requests.length < count) {
                hasNext = true;
            } else {
                hasNext = false;
            }
            Share.find({
                _id: {
                    $in: shareList
                }
            }).populate('group').populate('user')
            .populate('from.share').populate('from.user').populate('from.group')
            .exec(function(err, shares) {
                var content = [];
                shares.map(function(item, key) {
                    var result = {};
                    result.type = 'view';
                    result._id = item._id;
                    result.commentsCount = item.comments.length;
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
                    if (item.group) {
                        result.group = {
                            name: item.group.name,
                            id: item.group.id,
                            _id: item.group._id,
                            avatar: item.group.avatar
                        };
                    }
                    result.isFork = item.isFork;
                    if (item.isFork) {
                        result.from = {
                            user: {
                                name: item.from.user.name,
                                id: item.from.user.id,
                                _id: item.from.user._id
                            },
                            share: {
                                createAt: item.from.share.createAt,
                                content: item.from.share.content,
                                _id: item.from.share._id
                            }
                        };
                        if (item.from.group) {
                            result.from.group = {
                                name: item.from.group.name,
                                id: item.from.group.id,
                                _id: item.from.group._id
                            };
                        }
                    }
                    result.liked = false;
                    item.likes.map(function(like) {
                        if (like.toString() == user._id.toString()) {
                            result.liked = true;
                        }
                    });
                    result.likes = item.likes.length;
                    content.push(result);
                });
                res.send({
                    code: 200,
                    requests: content.reverse(),
                    count: count,
                    hasNext: hasNext 
                });
                Request.find({
                    to: user._id,
                    type: 'at',
                    is_delete: false
                }).exec(function(err, requests) {
                    if (err || !requests) {
                        return false;
                    }
                    requests.map(function(request,key) {
                        request.is_delete = true;
                        request.save(function(err,request) {
                            console.log('read at msg : ' + request.is_delete);
                        });
                    })
                });
            });
        });
    });
};
var getNotice = function(req, res) {
    var user = req.session.user;
    var page = req.query.page || 1;
    var perPageItems = req.query.perPageItems || 30;
    var query = {
        to: user._id,
        type: 'notice',
        is_delete: false
    };

    Request.find(query).populate('to').populate('group')
    .sort('-createAt')
    .skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, requests) {
        Request.find(query).count().exec(function(err, count) {
            var content = [];
            var hasNext;
            requests.map(function(request, key) {
                var result = {};
                result.isNew = !request.hasDisposed;
                result.html = request.html;
                content.push(result);
            });
            if ((page - 1) * perPageItems + requests.length < count) {
                hasNext = true;
            } else {
                hasNext = false;
            }
            res.send({
                code: 200,
                requests: content,
                count: count,
                hasNext: hasNext
            });

            // 查阅之后设置为已读
            requests.map(function(request,key) {
                request.hasDisposed = true;
                request.save();
            });
        });
    });
};
var getShortNotice = function(req, res) {
    var user = req.session.user;
    var query = {
        to: user._id,
        type: 'notice',
        hasDisposed: false,
        is_delete: false
    };
    Request.find(query).count().exec(function(err, count) {
        Request.find({
            to: user._id,
            type: 'notice',
            is_delete: false
        }).sort('-createAt').limit(5).exec(function(err, requests) {
            var content = [];
            requests.map(function(request, key) {
                var result = {};
                result.isNew = !request.hasDisposed;
                result.content = request.content;
                content.push(result);
            });
            res.send({
                code: 200,
                info: count,
                hasMore: count - content.length,
                content: content
            });
        })
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
var getGroupByUser = function(req, res) {
    var user = req.session.user;
    var page = req.query.page || 1;
    var perPageItems = req.query.perPageItems || 20;

    User.findOne({
        _id: user._id
    }).populate('groups.join').exec(function(err, user) {
        var joinGroups = user.groups.join;
        var results = [];
        var count = joinGroups.length;
        var hasNext, pager;
        var content = joinGroups.reverse().slice(perPageItems * (page -1), perPageItems * page);
        content.map(function(group, key) {
            var result = {
                avatar: group.avatar,
                id: group.id,
                _id: group._id,
                industry: group.industry,
                name: group.name,
                followCount: group.followCount,
                count: group.count
            };
            results.push(result);
        });
        if (perPageItems * page < count) {
            hasNext = true;
        } else {
            hasNext = false;
        }
        if (perPageItems < count) {
            pager = true;
        } else {
            pager = false;
        }
        res.send({
            code: 200,
            count: count,
            hasNext: hasNext,
            pager: pager,
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
                    company: item.company,
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
    var perPageItems = 20;

    User.findOne({
        _id: user._id
    }, function(err, user) {
        var array = [];
        var query = {
            role: 'user',
            is_delete: false
        };
        user.connects.map(function(item) {
            array.push(item.user.toString());
        });
        array.push(user._id.toString());

        query._id = {
            $nin: array
        };
        query.random = {
            $near: [Math.random(), 0]
        };

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
                        location: item.location,
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

var collect = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;

    Share.findOne({
        _id: id
    }).exec(function(err, share) {
        var index = -1;
        share.collects.map(function(item, key) {
            if (item.user.toString() == user._id) {
                index = key;
                return false;
            }
        });
        if (index > -1) {
            return res.send({
                code: 200,
                info: 'has collected'
            });
        }
        share.collects.push({
            user: user._id,
            date: new Date()
        });
        share.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};
var unCollect = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;

    Share.findOne({
        _id: id
    }).exec(function(err, share) {
        var index = -1;
        share.collects.map(function(item, key) {
            if (item.user.toString() == user._id) {
                index = key;
                return false;
            }
        });
        if (index === -1) {
            return res.send({
                code: 200,
                info: 'no collected'
            });
        }
        share.collects.splice(index, 1);
        share.save(function(err) {
            res.send({
                code: 200
            });
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
                    company: item.company,
                    companyLogo: item.companyLogo,
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
        is_delete: false,
        'resumes.user': {
            $nin: [user._id]
        }
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
                company: item.company,
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
var getSidebarList = function(req, res) {
    var user = req.session.user;
    UserProfile.findOne({
        _id: user.profile
    }).exec(function(err, profile) {
        profile.getWeekVisit(function(err, count) {
            Share.find({
                type: 'job',
                is_delete: false,
                random: {
                    $near: [Math.random(), 0]
                }
            }).limit(2).populate('user').exec(function(err, shares) {
                if (err) {
                    console.log(err);
                }
                var jobs = [];
                shares.map(function(item, key) {
                    var result = {};
                    result.company = item.company;
                    result.companyLogo = item.companyLogo;
                    result.position = item.position;
                    result.location = item.location;
                    result.date = item.createAt;
                    result.id = item.id;
                    result._id = item._id;
                    result.user = {
                        name: item.user.name,
                        avatar: item.user.avatar,
                        id: item.user.id,
                        _id: item.user._id
                    };
                    jobs.push(result);
                });

                User.find({
                    role: 'user',
                    is_delete: false,
                    random: {
                        $near: [Math.random(), 0]
                    }
                }).limit(2).exec(function(err, users) {
                    if (err) {
                        console.log(err);
                    }
                    var connects = [];
                    users.map(function(item, key) {
                        var result = {};
                        result.id = item.id;
                        result._id = item._id;
                        result.name = item.name;
                        result.avatar = item.avatar;
                        result.occupation = item.occupation;
                        result.location = item.location;
                        connects.push(result);
                    });
                    res.send({
                        code: 200,
                        weekVisit: count,
                        users: connects,
                        jobs: jobs
                    });
                });
            });    
        });
    });
};
var getRandomUser = function(req, res) {
    var user = req.session.user;
    User.find({
        role: 'user',
        is_delete: false,
        random: {
            $near: [Math.random(), 0]
        }
    }).limit(1).exec(function(err, users) {
        var user = users[0];
        var result = {};
        result.id = user.id;
        result._id = user._id;
        result.name = user.name;
        result.avatar = user.avatar;
        result.occupation = user.occupation;
        result.location = user.location;
        res.send({
            code: 200,
            user: result
        });
    });
};

// feedback
var feedback = function(req, res) {
    var userEmail = req.body.email;
    var content = req.body.content;
    var name = req.body.name;

    if (!userEmail) {
        return res.send({
            code: 404,
            info: 'email incomplete'
        });
    }
    if (!content) {
        return res.send({
            code: 404,
            info: 'content is blank'
        });
    }
    if (!name) {
        return res.send({
            code: 404,
            info: 'name is blank'
        });
    }

    Feedback.createNew({
        name: name,
        email: userEmail,
        content: content
    }, function(err, feedback) {
        res.send({
            code: 200
        });
        email({
            name: name,
            email: userEmail,
            content: content
        }, true);
    });
};


module.exports = function(app) {
    app.post('/api/user/register', create);
    app.post('/api/user/login', login);
    app.post('/api/user/logout', logout);
    app.post('/api/user/userbasic', middleware.apiLogin, setUserBasic);
    app.post('/api/user/acitveResend', middleware.apiLogin, reSendActiveCode);

    // trends
    app.get('/api/user/trend', middleware.check_login, getTrends);
    app.get('/api/user/myActive', middleware.check_login, getMyActive);
    app.get('/api/user/myShare', middleware.check_login, getMyShare);
    app.get('/api/user/myShare/search', middleware.check_login, myShareSearch);
    app.get('/api/user/myjob', middleware.check_login, getMyJob);
    app.get('/api/user/mayknow', middleware.check_login, getMayKnowConnects);
    app.get('/api/user/id', middleware.check_login, searchById);
    app.get('/api/user/sending', middleware.check_login, getMysending);
    app.get('/api/user/jobrecommend', middleware.check_login, getJobRecommend);
    app.get('/api/user/getSidebar', middleware.check_login, getSidebarList);
    
    // company profile
    app.post('/api/user/like', middleware.check_login, companyLike);
    app.post('/api/user/unlike', middleware.check_login, companyUnlike);
    app.post('/api/user/follow', middleware.check_login, companyFollow);
    app.post('/api/user/unfollow', middleware.check_login, companyUnfollow);
    app.get('/api/user/companyActive', getCompanyActive);

    // collect
    app.get('/api/user/myCollect', middleware.check_login, getMyCollect);
    app.get('/api/user/myCollect/search', middleware.check_login, myCollectSearch);
    app.post('/api/user/collect', middleware.check_login, collect);
    app.post('/api/user/uncollect', middleware.check_login, unCollect);

    // skills
    app.post('/api/user/skills/add', middleware.apiLogin, userSkillsAdd);
    app.post('/api/user/skills/remove', middleware.apiLogin, userSkillsRemove);
    app.post('/api/user/skills/vote', middleware.apiLogin, userSkillsVote);

    // notify
    app.get('/api/notify', middleware.check_login, getNotifyCount);
    app.get('/api/notify/comment', middleware.check_login, getCommentMe);
    app.get('/api/notify/at', middleware.check_login, getAtShare);
    app.get('/api/notify/notice', middleware.check_login, getNotice);
    app.get('/api/notify/shortNotice', middleware.check_login, getShortNotice);
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
    app.get('/api/connects/randomOne', middleware.check_login, getRandomUser);

    // message
    app.post('/api/message/send', sendMessage);
    app.post('/api/message/read', readMessage);

    // user operation
    app.get('/api/user/:id/card', getUserCard);
    app.get('/api/user/userList', getConnectList);

    // feedback
    app.post('/api/feedback', feedback);
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