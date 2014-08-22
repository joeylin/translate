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

// user
var getUsers = function(req, res) {
    var page = req.query.page || 1;
    var perPageItems = 30;
    var type = req.query.type;
    var query = {
        role: 'user',
        is_delete: false
    };
    if (type === 'delete') {
        query = {
            role: 'user',
            is_delete: true
        };
    }
    
    User.find(query).exec(function(err, users) {
        User.find(query).count().exec(function(err, count) {
            var content = [];
            var hasNext;
            if (err || !users) {
                return res.send({
                    code: 200,
                    content: []
                });
            }
            users.map(function(item, key) {
                var result = {
                    name: item.name,
                    id: item.id,
                    _id: item._id,
                    avatar: item.avatar
                };
                content.push(item);
            });
            if ((page - 1) * perPageItems + content.length < count) {
                hasNext = true;
            } else {
                hasNext = false;
            }
            res.send({
                code: 200,
                count: count,
                content: content,
                hasNext: hasNext
            });
        });
    });
};
var delUser = function(req, res) {
    var id = req.body.id;
    User.findOne({
        _id: id
    }).exec(function(err, user) {
        if (err || !user) {
            return res.send({
                code: 404
            });
        }
        user.is_delete = true;
        user.save(function(err, user) {
            res.send({
                code: 200
            });
        });
    });
};
var setAdmin = function(req, res) {
    var id = req.body.id;
    User.findOne({
        _id: id
    }).exec(function(err, user) {
        if (err || !user) {
            return res.send({
                code: 404
            });
        }
        user.isAdmin = true;
        user.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};

// invite
var generate = function(req, res) {
    var user = req.session.user;
    Invitation.createNew({
        user: user._id,
        type: 'system'
    }, function(err, invite) {
        res.send({
            code: 200,
            inviteCode: invite.code
        });
    });
};
var toSpecificGroup = function(req, res) {
    var user = req.session.user;
    var groupId = req.body.id;
    var num = parseInt(req.body.num, 10) || 0;
    if (!num) {
        return res.send({
            code: 200
        });
    }
    Group.findOne({
        _id: groupId
    }).exec(function(err, group) {
        group.codeCount += num;
        group.save(function(err,group) {
            res.send({
                code: 200
            });
        });
    });
};
var toAllGroup = function(req, res) {
    var user = req.session.user;
    var num = parseInt(req.body.num, 10) || 0;
    var query = {
        is_delete: false
    };
    if (!num) {
        return res.send({
            code: 200
        });
    }
    Group.update(query, {$inc: {
        codeCount: num
    }},{multi: true}, function(err, numberAffected, raw) {
        if (err) {
            return res.send({
                code: 404
            });
        }
        res.send({
            code: 200,
            count: numberAffected
        });
    });
};

// group
var apply = function(req, res) {
    var user = req.session.user;
    var name = req.body.name;
    var industry = req.body.industry;
    var reason = req.body.industry;

    var request = new Request();
    request.type = 'admin';
    request.role = 'group';
    request.info = {
        name: name,
        industry: industry,
        reason: reason
    };
    request.from = user._id;
    request.markModified('info');
    request.save(function(err, request) {
        if (err || !request) {
            return res.send({
                code: 404
            });
        }
        res.send({
            code: 200
        });
    });
};
var passGroup = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    Request.findOne({
        _id: id
    }).exec(function(err, request) {
        if (err || !request) {
            return res.send({
                code: 404,
                info: 'wrong operation'
            });
        }
        var name = request.info.name;
        var industry = request.info.industry;
        var from = request.from;
        request.hasDisposed = true;
        request.isPass = true;
        request.save(function(err, request) {
            if (err) {
                return res.send({
                    code: 404,
                    info: err.msg
                });
            }
            var obj = {
                name: name,
                creator: from,
                industry: industry
            };
            Group.createNew(obj, function(err, group) {
                if (err || !group) {
                    return res.send({
                        code: 404,
                        info: err.msg
                    });
                }
                var notice = {
                    to: from,
                    group: group._id,
                    title: 'apply-pass'
                };
                Request.notice(notice, function(err) {
                    res.send({
                        code: 200
                    });
                });
            });
        });
    });
};
var failGroup = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    var msg = req.body.msg;
    Request.findOne({
        _id: id
    }).exec(function(err, request) {
        var name = request.info.name;
        var industry = request.info.industry;
        var reason = request.info.reason;
        var from = request.from;
        request.hasDisposed = true;
        request.isPass = false;
        request.info.msg = msg;
        request.markModified('info.msg');
        request.save(function(err, request) {
            if (err) {
                return res.send({
                    code: 404,
                    info: err.msg
                });
            }
            var notice = {
                to: from,
                info: {
                    name: name,
                    industry: industry,
                    reason: reason,
                    msg: msg
                },
                title: 'apply-fail'
            };
            Request.notice(notice, function(err) {
                res.send({
                    code: 200
                });
            });
        });
    });
};
var getApply = function(req, res) {
    var user = req.session.user;
    var page = req.query.page || 1;
    var perPageItems = 30;
    var query = {
        type: 'admin',
        hasDisposed: false,
        role: 'group'
    };
    Request.find(query).skip((page - 1) * perPageItems).limit(perPageItems)
    .populate('from').exec(function(err, requests) {
        Request.find(query).count().exec(function(err, count) {
            var content = [];
            var hasNext;
            requests.map(function(item, key) {
                var result = {};
                result._id = item._id;
                result.name = item.info.name;
                result.reason = item.info.reason;
                result.industry = item.info.industry;
                result.user = {};
                result.user.name = item.from.name;
                result.user.id = item.from.id;
                result.user._id = item.from._id;
                result.hasDisposed = item.hasDisposed;
                result.isPass = item.isPass;
                result.msg = item.msg;
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
module.exports = function(app) {
	// user
    app.get('/api/admin/user/getUsers', middleware.check_admin, getUsers);
    app.post('/api/admin/user/delete', middleware.check_admin, delUser);
    app.post('/api/admin/user/setAdmin', middleware.check_admin, setAdmin);

    // invite
    app.post('/api/admin/invite/generate', middleware.check_admin, generate);
    app.post('/api/admin/invite/group', middleware.check_admin, toSpecificGroup);
    app.post('/api/admin/invite/allGroup', middleware.check_admin, toAllGroup);

	// group
    app.post('/api/admin/group/apply', middleware.check_admin, apply);
    app.post('/api/admin/group/apply/pass', middleware.check_admin, passGroup);
    app.post('/api/admin/group/apply/fail', middleware.check_admin, failGroup);
    app.get('/api/admin/group/getApply', middleware.check_admin, getApply);
};