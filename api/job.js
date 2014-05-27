var Models = require('../models');
var Job = Models.Job;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Share = Models.Share;
var Request = Models.Request;

var addJob = function(req, res) {
    var user = req.session.user;
    var job = req.body || {};
    job.user = user._id;

    Job.createNew(job, function(err, job) {
        user.findOne({
            _id: user._id
        }, function(err, user) {
            user.jobs.push(job._id);
            user.trends.push(job._id);
            user.save(function(err) {
                res.send({
                    code: 200,
                    content: job
                });
            });
        });
    });
};
var deleteJob = function(req, res) {
    var user = req.session.user;
    var jobId = req.body.jobId;
    User.findOne({
        _id: user._id
    }, function(err, user) {
        var index = user.jobs.indexOf(jobId);
        if (index < 0) {
            return res.send({
                code: 404,
                info: 'no job'
            });
        }
        user.jobs.splice(index, 1);
        user.save(function(err) {
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
    var user = req.session.user;

    var comment = {
        content: req.body.content,
        replyTo: req.body.replyTo,
        user: user._id
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
    var user = req.session.user;
    var commentId = req.body.commentId;
    Job.findOne({
        _id: jobId
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
                if (comment.user !== user._id) {
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
    var jobId = req.body.jobId;
    Job.findOne({
        _id: jobId
    }, function(err, job) {
        var index = job.likes.indexOf(user._id);
        if (index >= 0) {
            return res.send({
                code: 404,
                info: 'has liked'
            });
        }
        job.likes.push(user.uid);
        job.save(function(err) {
            res.send({
                code: 200,
                info: 'success'
            });
        });
    });
};
var jobUnlike = function(req, res) {
    var user = req.session.user;
    var jobId = req.body.jobId;
    Job.findOne({
        _id: jobId
    }, function(err, job) {
        var index = job.likes.indexOf(user._id);
        if (index < 0) {
            return res.send({
                code: 404,
                info: 'no liked'
            });
        }
        job.likes.splice(index, 1);
        job.save(function(err) {
            res.send({
                code: 200,
                info: 'success'
            });
        });
    });
};
var collectJob = function(req, res) {
    var user = req.session.user;
    var jobId = req.body.jobId;
    User.findOne({
        _id: user._id
    }, function(err, user) {
        var index = user.collects.job.indexOf(jobId);
        if (index >= 0) {
            return res.send({
                code: 404,
                info: 'has collected'
            });
        }
        user.collects.job.push(jobId);
        user.save(function(err) {
            res.send({
                code: 200,
                info: 'success'
            });
        });
    });
};
var unCollectJob = function(req, res) {
    var user = req.session.user;
    var jobId = req.body.jobId;
    User.findOne({
        _id: user._id
    }, function(err, user) {
        var index = user.collects.job.indexOf(jobId);
        if (index < 0) {
            return res.send({
                code: 404,
                info: 'never collected'
            });
        }
        user.collects.job.splice(index, 1);
        user.save(function(err) {
            res.send({
                code: 200,
                info: 'success'
            });
        });
    });
};
module.exports = function(app) {
    app.post('/api/job/collect', collectJob);
    app.post('/api/job/uncollect', unCollectJob);
    app.post('/api/job/unlike', jobUnlike);
    app.post('/api/job/like', jobLike);
    app.post('/api/job/delete', deleteJob);
    app.post('/api/job/add', addJob);
    app.get('/api/job/id/:id', getJobById);

    // comments
    app.post('/api/job/comments/add', addComment);
    app.post('/api/job/comments/delete', deleteComment);
};