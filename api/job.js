var Models = require('../models');
var Job = Models.Job;
var Company = Models.Company;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Share = Models.Share;

var addJob = function(req, res) {
    var company = req.session.company;
    var job = req.body || {};
    job.company = company.id;

    Job.createNew(job, function(err, job) {
        Company.findOne({
            _id: company.id
        }, function(err, company) {
            company.jobs.push(job._id);
            company.trends.push(job._id);
            company.save(function(err) {
                res.send({
                    code: 200,
                    content: job
                });
            });
        });
    });
};
var deleteJob = function(req, res) {
    var company = req.session.company;
    var jobId = req.body.jobId
    Company.findOne({
        _id: company.id
    }, function(err, company) {
        var index = company.jobs.indexOf(jobId);
        if (index < 0) {
            return res.send({
                code: 404,
                info: 'no job'
            });
        }
        company.jobs.splice(index, 1);
        company.save(function(err) {
            res.send({
                code: 200,
                info: 'success'
            });
        });
    });
};
var getJobById = function(req, res) {
    var id = req.params.id;
    Job.findOne({
        _id: id
    }).populate('comments').exec(function(err, job) {
        if (err) {
            return res.send({
                code: 404,
                info: 'unknow job, or have delete'
            });
        }
        res.send({
            code: 200,
            content: job
        });
    });
};
var addComment = function(req, res) {
    var jobId = req.body.jobId;
    var company = req.session.company;

    var comment = {
        content: req.body.content,
        replyTo: req.body.replyTo,
        company: company.id
    };
    Comment.createNew(comment, function(err, comment) {
        Job.findOne({
            _id: jobId
        }, function(err, job) {
            job.comments.push(comment._id);
            job.save(function(err) {
                res.send({
                    code: 200,
                    content: comment
                });
            });
        });
    });
};
var deleteComment = function(req, res) {
    var jobId = req.body.jobId;
    var company = req.session.company;
    var commentId = req.body.commentId;
    Job.findOne({
        _id: shareId
    }, function(err, job) {
        var index = job.comments.indexOf(commentId);
        if (index < 0) {
            return res.send({
                code: 404,
                info: 'no auth'
            });
        } else {
            Comment.findOne({
                _id: commentId
            }, function(err, comment) {
                if (comment.company != company.id) {
                    return res.send({
                        code: 404,
                        info: 'no auth'
                    });
                }
                comment.remove();
                job.comments.splice(index, 1);
                job.save(function(err) {
                    res.send({
                        code: 200,
                        info: 'success'
                    });
                });
            });
        }
    });
};
var jobLike = function(req, res) {
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
    app.post('/api/job/collect', collectShare);
    app.post('/api/job/uncollect', unCollectShare);
    app.post('/api/job/unlike', shareUnlike);
    app.post('/api/job/like', shareLike);
    app.post('/api/job/delete', deleteShare);
    app.post('/api/job/add', addJob);
    app.post('/api/job/like', addShare);
    app.get('/api/job/user', getShareByUser);
    app.get('/api/job/id/:id', getShareById);

    // comments
    app.post('/api/job/comments/add', addComment);
    app.post('/api/job/comments/delete', deleteComment);
};