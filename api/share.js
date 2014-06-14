var Models = require('../models');
var Job = Models.Job;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Share = Models.Share;
var Request = Models.Request;

var middleware = require('./middleware');

var getShareByUser = function(req, res) {
    var user = req.session.user;
    User.findOne({
        _id: user._id
    }).populate('share').exec(function(err, user) {
        res.send({
            code: 200,
            content: user.share
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
var getShareComments = function(req, res) {
    var shareId = req.query.shareId;
    Share.findOne({
        _id: shareId
    }).exec(function(err, share) {
        if (err || !share) {
            return res.send({
                code: 404,
                info: 'cant get comments'
            });
        }
        console.log(share);
        var count = share.comments.length;
        var latest = share.comments.slice(-15);
        Comment.find({
            _id: {
                $in: latest
            }
        }).sort({
            createAt: -1
        }).populate('user').exec(function(err, comments) {
            var results = [];
            comments.map(function(comment) {
                var result = {
                    content: comment.content,
                    date: comment.createAt.getTime(),
                    user: {
                        name: comment.user.name,
                        id: comment.user.id,
                        _id: comment.user._id,
                        avatar: comment.user.avatar
                    }
                };
                results.push(result);
            });
            res.send({
                code: 200,
                comments: results,
                count: count
            });
        });
    });
};
var addShare = function(req, res) {
    var user = req.session.user;
    var share = req.body;
    share.user = user._id;
    Share.createNew(share, function(err, data) {
        res.send({
            code: 200,
            content: {
                createAt: data.createAt.getTime(),
                _id: data._id
            }
        });
    });
};
var deleteShare = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    Share.delete(id, user._id, function(err) {
        res.send({
            code: 200,
            info: 'delete success'
        });
    });
};
var addComment = function(req, res) {
    var shareId = req.body.shareId;
    var user = req.session.user;
    var comment = {
        content: req.body.content,
        replyTo: req.body.replyTo,
        user: user._id
    };
    Comment.createNew(comment, function(err, comment) {
        Share.findOne({
            _id: shareId
        }, function(err, share) {
            share.comments.push(comment._id);
            share.save(function(err) {
                res.send({
                    code: 200,
                    content: {
                        createAt: comment.createAt.getTime(),
                        _id: comment._id
                    }
                });
            });
        });
    });
};
var deleteComment = function(req, res) {
    var shareId = req.body.shareId;
    var user = req.session.user;
    var index = req.body.commentIndex;
    Share.findOne({
        _id: shareId
    }, function(err, share) {
        if (index < 0) {
            return res.send({
                code: 404,
                info: 'no auth'
            });
        } else {
            Comment.findOne({
                _id: share.comments[index]
            }, function(err, comment) {
                // only comment author or share author can delete comment
                if (comment.user.toString() == user._id || share.user.toString() == user._id) {
                    comment.remove();
                    share.comments.splice(index, 1);
                    share.save(function(err) {
                        res.send({
                            code: 200,
                            info: 'success'
                        });
                    });
                } else {
                    return res.send({
                        code: 404,
                        info: 'no auth'
                    });
                }
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
        var index = -1;
        share.likes.map(function(like, key) {
            if (like.toString() == user._id) {
                index = key;
            }
        });
        if (index >= 0) {
            return res.send({
                code: 404,
                info: 'has liked'
            });
        }
        share.likes.push(user._id);
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
        var index = -1;
        share.likes.map(function(like, key) {
            if (like.toString() == user._id) {
                index = key;
            }
        });
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
        _id: user._id
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
        _id: user._id
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
    app.post('/api/share/collect', middleware.check_login, collectShare);
    app.post('/api/share/uncollect', middleware.check_login, unCollectShare);
    app.post('/api/share/unlike', middleware.check_login, shareUnlike);
    app.post('/api/share/like', middleware.check_login, shareLike);
    app.post('/api/share/delete', middleware.check_login, deleteShare);
    app.post('/api/share/add', middleware.check_login, addShare);
    app.get('/api/share/user', middleware.check_login, getShareByUser);
    app.get('/api/share/id/:id', getShareById);
    app.get('/api/share/comments', getShareComments);

    // comments
    app.post('/api/share/comments/add', middleware.check_login, addComment);
    app.post('/api/share/comments/delete', middleware.check_login, deleteComment);
};