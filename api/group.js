var Models = require('../models');
var Job = Models.Job;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Share = Models.Share;
var Request = Models.Request;
var Group = Models.Group;
var middleware = require('./middleware');

var async = require('async');

var create = function(req, res) {
    var user = req.session.user;
    var name = req.body.name;
    var industry = req.body.industry;
    var obj = {
        name: name,
        creator: user._id,
        industry: industry
    };
    Group.createNew(obj, function(err, group) {
        res.send({
            code: 200,
            groupId: group.id
        });
    });
};
var joinRequest = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    Group.findOne({
        id: id
    }, function(err, group) {
        var items = [];
        items.push(group.creator);
        items.concat(group.admin);
        Request.find({
            group: group._id,
            from: user._id,
            hasDisposed: false,
        }, function(err, requests) {
            if ( !! requests.length) {
                return res.send({
                    code: 200
                });
            }
            async.eachSeries(items, function(item, next) {
                var obj = {
                    from: user._id,
                    to: item,
                    type: 'group',
                    group: group._id
                };
                Request.createNew(obj, function(err, request) {
                    if (err) {
                        console.log(err);
                    }
                    next();
                });
            }, function(err) {
                res.send({
                    code: 200,
                    info: 'request has sent'
                });
            });
        });
    });
};
var checkRequest = function(req, res) {
    var user = req.session.user;
    var requestId = req.body.requestId;
    var value = req.body.value;

    Request.findOne({
        _id: requestId
    }, function(err, request) {
        if (request.hasDisposed) {
            return res.send({
                code: 200,
                info: 'others checked'
            });
        }
        if (value) {
            Group.join(request.group, user._id, function(err, group) {
                Request.update({
                    from: request.from,
                    group: request.group
                }, {
                    $set: {
                        hasDisposed: true,
                        isPass: true
                    }
                }, function(err) {
                    res.send({
                        code: 200
                    });
                });
            });
        } else {
            Request.update({
                from: request.from,
                group: request.group
            }, {
                $set: {
                    hasDisposed: true,
                    isPass: false
                }
            }, function(err) {
                res.send({
                    code: 200
                });
            });
        }

    });
};
var join = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    Group.join(id, user._id, function(err, group) {
        res.send({
            code: 200
        });
    });
};
var quit = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    Group.quit(id, user._id, function(err, group) {
        res.send({
            code: 200
        });
    });
};
var memberDelete = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    var deleteId = req.body.deleteId;
    Group.findOne({
        _id: id
    }, function(err, group) {
        if (group.isAdmin(user._id)) {
            group.deleteMember(deleteId, function(err, group) {
                res.send({
                    code: 200
                });
            });
        }
    });
};
var adminDelete = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    var deleteId = req.body.deleteId;
    Group.findOne({
        _id: id
    }, function(err, group) {
        if (group.isCreator(user._id)) {
            group.deleteAdmin(deleteId, function(err, group) {
                res.send({
                    code: 200
                });
            });
        }
    });
};
var adminAdd = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    var adminId = req.body.adminId;
    Group.findOne({
        _id: id
    }, function(err, group) {
        if (grou.admin.length > 5) {
            return res.send({
                code: 404,
                info: 'bound of limit'
            });
        }
        group.addAdmin(adminId, function(err, group) {
            res.send({
                code: 200
            });
        });
    });
};
var getPost = function(req, res) {
    var user = req.session.user;
    var id = req.params.id;
    var page = req.query.page || 1;
    var size = req.query.size || 20;
    Share.find({
        group: id,
        is_delete: false
    }).sort({
        createAt: -1
    }).populate('user').skip((page - 1) * size).limit(size).exec(function(err, trends) {
        if (!trends) {
            return res.send({
                code: 200,
                info: 'no share'
            });
        }
        Share.find({
            group: id,
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
                result.id = item.id;
                result.user = {
                    name: item.user.name,
                    avatar: item.user.avatar,
                    _id: item.user._id,
                    id: item.user.id
                };
                result.liked = false;
                if (user) {
                    item.likes.map(function(like) {
                        if (like.toString() == user._id.toString()) {
                            result.liked = true;
                        }
                    });
                }
                result.likes = item.likes.length;
                content.push(result);
            });
            if ((page - 1) * size + content.length < count) {
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
var setBasic = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    var name = req.body.name;
    var industry = req.body.industry;
    var announcement = req.body.announcement;

    Group.findOne({
        _id: id
    }, function(err, group) {
        group.name = name;
        group.announcement = announcement;
        group.industry = industry;
        group.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};
var setAvatar = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    var avatar = req.body.avatar;

    Group.findOne({
        _id: id
    }, function(err, group) {
        group.avatar = avatar;
        group.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};
var getMembers = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    Group.findOne({
        _id: id
    }).populate('members').populate('creator').populate('admin').exec(function(err, group) {
        var creator = {
            _id: group.creator._id,
            name: group.creator.name,
            avatar: group.creator.avatar,
            post: 12,
            isCreator: true,
            isAdmin: false
        };
        var admin = [];
        group.admin.map(function(item, key) {
            var result = {
                _id: item._id,
                name: item.name,
                avatar: item.avatar,
                post: 2,
                isCreator: false,
                isAdmin: true
            };
            admin.push(result);
        });
        var members = [];
        group.members.map(function(item, key) {
            var result = {
                _id: item._id,
                name: item.name,
                avatar: item.avatar,
                post: 2,
                isCreator: false,
                isAdmin: true
            };
            members.push(result);
        });

        res.send({
            code: 200,
            creator: creator,
            admin: admin,
            members: members
        });
    });
};

module.exports = function(app) {
    app.post('/api/group/create', create);
    app.post('/api/group/joinRequest', joinRequest);
    app.post('/api/group/checkRequest', checkRequest);
    app.post('/api/group/join', join);
    app.post('/api/group/quit', quit);
    app.post('/api/group/member/delete', memberDelete);
    app.post('/api/group/admin/delete', adminDelete);
    app.post('/api/group/admin/add', adminAdd);
    app.post('/api/group/settings/basic', setBasic);
    app.post('/api/group/settings/avatar', setAvatar);
    app.post('/api/group/members', getMembers);

    app.get('/api/group/:id/post', getPost);
};