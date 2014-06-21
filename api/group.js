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
            code: 200
        });
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
    var perPageItems = 20;
    User.findOne({
        _id: user._id,
        is_delete: false,
        group: id
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
var setBasic = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    var name = req.body.name;
    var announcement = req.body.announcement;

    Group.findOne({
        _id: id
    }, function(err, group) {
        group.name = name;
        group.announcement = announcement;
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

module.exports = function(app) {
    app.post('/api/group/create', create);
    app.post('/api/group/join', join);
    app.post('/api/group/quit', quit);
    app.post('/api/group/member/delete', memberDelete);
    app.post('/api/group/admin/delete', adminDelete);
    app.post('/api/group/admin/add', adminAdd);
    app.post('/api/group/settings/basic', setBasic);
    app.post('/api/group/settings/avatar', setAvatar);

    app.get('/api/group/:id/post', getPost);
};