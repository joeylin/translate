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
    var user = req.session.user;
    console.log('getShare');
    User.find({
        _id: uid
    }).populate('share').exec(function(err, share) {
        res.send({
            code: 200,
            content: share
        });
    });
};
var getShareById = function(req, res) {
    var id = req.params.id;
    Share.findOne({
        _id: id
    }).populate('comments').exec(function(err,share) {
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
    var user = req.session.user;
    var share = {
        content: req.body.content,
        user = user.uid
    };
    Share.createNew(share, function(err,data) {
        User.findOne({
            _id: user.uid
        }, function(err, user) {
            user.share.push(data._id);
            user.save(function() {
                res.send({
                    code: 200,
                    content: data
                });
            });
        });         
    });
};
var deleteShare = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    User.findOne({
        _id: user.uid
    }, function(err, user) {
        var index = user.share.indexOf(id);
        if (index < 0) {
            return res.send({
                code: 404,
                info: 'no auth'
            });
        } else {
            Share.findOne({
                _id: id
            }, function(err,share) {
                share.remove();
                user.share.splice(index, 1);
                user.save(function(err) {
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
    var user = req.session.user;

    var comment = {
        content: req.body.content,
        replyTo: req.body.replyTo,
        user: user.uid
    };
    Comment.createNew(comment, function(err, comment) {
        Share.findOne({
            _id: shareId
        }, function(err,share) {
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
    var user = req.session.user;
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
    var user = req.session.user;
    var shareId = req.body.shareId;
    Share.findOne({
        _id: shareId
    }, function(err, share) {
        var index = share.likes.indexOf(shareId);
        if (index >= 0) {
            return res.send({
                code: 404,
                info: 'has liked'
            });
        }
        share.likes.push(user.uid);
        share.save(function(err) {
            res.send({
                code: 200,
                info: 'success'
            });
        });
    });
};
var shareUnlike = function(req, res) {
    var user = req.session.user;
    var shareId = req.body.shareId;
    Share.findOne({
        _id: shareId
    }, function(err, share) {
        var index = share.likes.indexOf(shareId);
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
var collectShare = function(req, res) {
    var user = req.session.user;
    var shareId = req.body.shareId;
    User.findOne({
        _id: id
    }, function(err, user) {
        var index = user.collects.share.indexOf(shareId);
        if (index >= 0) {
            return res.send({
                code: 404,
                info: 'has collected'
            });
        }
        user.collects.share.push(shareId);
        user.save(function(err) {
            res.send({
                code: 200,
                info: 'success'
            });
        });
    });
};
var unCollectShare = function(req, res) {
    var user = req.session.user;
    var shareId = req.body.shareId;
    User.findOne({
        _id: id
    }, function(err, user) {
        var index = user.collects.share.indexOf(shareId);
        if (index < 0) {
            return res.send({
                code: 404,
                info: 'never collected'
            });
        }
        user.collects.share.splice(index, 1);
        user.save(function(err) {
            res.send({
                code: 200,
                info: 'success'
            });
        });
    });
};
module.exports = function(app) {
    app.post('/api/share/collect', collectShare);
    app.post('/api/share/uncollect', unCollectShare);
    app.post('/api/share/unlike', shareUnlike);
    app.post('/api/share/like', shareLike);
    app.post('/api/share/delete', deleteShare);
    app.post('/api/share/add', addShare);
    app.post('/api/share/like', addShare);
    app.get('/api/share/user', getShareByUser);
    app.get('/api/share/id/:id', getShareById);

    // comments
    app.post('/api/share/comments/add', addComment);
    app.post('/api/share/comments/delete', deleteComment);
};