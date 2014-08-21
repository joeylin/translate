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
	
	// group
    app.post('/api/admin/group/apply', middleware.check_admin, apply);
    app.post('/api/admin/group/apply/pass', middleware.check_admin, passGroup);
    app.post('/api/admin/group/apply/fail', middleware.check_admin, failGroup);
    app.get('/api/admin/group/getApply', middleware.check_admin, getApply);
};