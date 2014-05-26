var Models = require('../models');
var Job = Models.Job;
var Company = Models.Company;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Share = Models.Share;

var middleware = require('./middleware');

var getShareByUser = function(req, res) {
    var company = req.session.company;
    Company.findOne({
        _id: company.id
    }).populate('share').exec(function(err, company) {
        res.send({
            code: 200,
            content: company.share
        });
    });
};
var getShareById = function(req, res) {
    var id = req.params.id;
    Share.findOne({
        _id: id
    }).populate('comments').exec(function(err, share) {
        if (err) {
            return res.send({
                code: 404,
                info: 'unknow share, or have delete'
            });
        }
        res.send({
            code: 200,
            content: share
        });
    });
};
var addShare = function(req, res) {
    var company = req.session.company;
    var share = {
        content: req.body.content,
        _type: 'company',
        user: company.id
    };
    Share.createNew(share, function(err, data) {
        Company.findOne({
            _id: company.id
        }, function(err, company) {
            company.share.push(data._id);
            company.trends.push(data._id);
            company.save(function() {
                res.send({
                    code: 200,
                    content: data
                });
            });
        });
    });
};
var deleteShare = function(req, res) {
    var company = req.session.company;
    var id = req.body.id;
    User.findOne({
        _id: company.id
    }, function(err, company) {
        var index = company.share.indexOf(id);
        if (index < 0) {
            return res.send({
                code: 404,
                info: 'no auth'
            });
        } else {
            Share.findOne({
                _id: id
            }, function(err, share) {
                share.remove();
                company.share.splice(index, 1);
                company.save(function(err) {
                    res.send({
                        code: 200
                    });
                });
            });
        }
    });
};
var addComment = function(req, res) {
    var shareId = req.body.shareId;
    var company = req.session.company;

    var comment = {
        content: req.body.content,
        replyTo: req.body.replyTo,
        _type: 'company',
        user: company.id
    };
    Comment.createNew(comment, function(err, comment) {
        Share.findOne({
            _id: shareId
        }, function(err, share) {
            share.comments.push(comment._id);
            share.save(function(err) {
                res.send({
                    code: 200,
                    content: comment
                });
            });
        });
    });
};
var deleteComment = function(req, res) {
    var shareId = req.body.shareId;
    var company = req.session.company;
    var commentId = req.body.commentId;
    Share.findOne({
        _id: shareId
    }, function(err, share) {
        var index = share.comments.indexOf(commentId);
        if (index < 0) {
            return res.send({
                code: 404,
                info: 'no auth'
            });
        } else {
            Comment.findOne({
                _id: commentId
            }, function(err, comment) {
                comment.remove();
                share.comments.splice(index, 1);
                share.save(function(err) {
                    res.send({
                        code: 200,
                        info: 'success'
                    });
                });
            });
        }
    });
};
var shareLike = function(req, res) {
    var company = req.session.company;
    var shareId = req.body.shareId;
    Share.findOne({
        _id: shareId
    }, function(err, share) {
        var index = share.likes.indexOf(company.id);
        if (index >= 0) {
            return res.send({
                code: 404,
                info: 'has liked'
            });
        }
        share.likes.push(company.id);
        share.save(function(err) {
            res.send({
                code: 200,
                info: 'success'
            });
        });
    });
};
var shareUnlike = function(req, res) {
    var company = req.session.company;
    var shareId = req.body.shareId;
    Share.findOne({
        _id: shareId
    }, function(err, share) {
        var index = share.likes.indexOf(company.id);
        if (index < 0) {
            return res.send({
                code: 404,
                info: 'no liked'
            });
        }
        share.likes.splice(index, 1);
        share.save(function(err) {
            res.send({
                code: 200,
                info: 'success'
            });
        });
    });
};
module.exports = function(app) {
    app.post('/api/share/company/unlike', shareUnlike);
    app.post('/api/share/company/like', shareLike);
    app.post('/api/share/company/delete', deleteShare);
    app.post('/api/share/company/add', addShare);
    app.post('/api/share/company/like', addShare);
    app.get('/api/share/company/user', getShareByUser);
    app.get('/api/share/company/id/:id', getShareById);

    // comments
    app.post('/api/share/company/comments/add', addComment);
    app.post('/api/share/company/comments/delete', deleteComment);
};