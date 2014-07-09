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
    var page = req.query.page || 1;
    var perPageItems = req.query.perPageItems || 15;
    Share.findOne({
        _id: shareId
    }).exec(function(err, share) {
        if (err || !share) {
            return res.send({
                code: 404,
                info: 'cant get comments'
            });
        }
        var count = share.comments.length;
        // todo fix pager
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
var editShare = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    Share.findOne({
        _id: id
    }, function(err, share) {
        share.content = req.body.content;
        share.user = req.body.user;
        share.type = req.body.type;
        share.jobType = req.body.jobType;
        share.position = req.body.position;
        share.department = req.body.department;
        share.company = req.body.company;
        share.companyIntro = req.body.companyIntro;
        share.paymentStart = req.body.paymentStart;
        share.paymentEnd = req.body.paymentEnd;
        share.degree = req.body.degree;
        share.skills = req.body.skills;
        share.workYears = req.body.workYears;
        share.location = req.body.location;
        share.summary = req.body.summary;
        share.detail = req.body.detail;
        share.group = req.body.group;
        share.save(function(err) {
            res.send({
                code: 200
            });
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

//jobs
var getJobById = function(req, res) {
    var user = req.session.user;
    var id = req.params.id;
    Share.findOne({
        id: id
    }, function(err, share) {
        if (!share) {
            return res.send({
                code: 404,
                info: 'no job'
            });
        }
        if (share.user.toString() !== user._id) {
            return res.send({
                code: 200,
                job: {}
            });
        }

        var obj = {};
        obj.type = share.jobType;
        obj.paymentStart = share.paymentStart;
        obj.paymentEnd = share.paymentEnd;
        obj.department = share.department;
        obj.degree = share.degree;
        obj.position = share.position;
        obj.location = share.location;
        obj.summary = share.summary;
        obj.company = share.company;
        obj.companyIntro = share.companyIntro;
        obj.workYears = share.workYears;
        obj.skills = share.skills;
        obj.id = share._id;

        res.send({
            code: 200,
            job: obj
        });
    });
};
var getLatestJobs = function(req, res) {
    var user = req.session.user;
    var page = req.query.page || 1;
    var perPageItems = 30;

    Share.find({
        type: 'job',
        status: 'publish',
        is_delete: false
    }).sort({
        createAt: -1
    }).populate('user').sort('-createAt').skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, shares) {
        Share.find({
            type: 'job',
            status: 'publish',
            is_delete: false
        }).count().exec(function(err, count) {
            User.findOne({
                _id: user._id
            }, function(err, user) {
                var results = [];
                var hasNext;
                shares.map(function(item) {
                    // test
                    if (!item.user) {
                        return;
                    }
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
                        number: item.number,
                        skills: item.skills,
                        location: item.location,
                        degree: item.degree,
                        views: item.views,
                        join: item.resumes.length,
                        type: item.jobType,
                        date: item.createAt.getTime(),
                        isSaved: false
                    };
                    var index = -1;
                    user.collects.job.map(function(job, key) {
                        if (job.toString() == item._id.toString()) {
                            index = key;
                        }
                    });
                    if (index > -1) {
                        obj.isSaved = true;
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
    });
};
var jobsSearch = function(req, res) {
    var user = req.session.user;
    var page = req.query.page || 1;
    var perPageItems = 30;
    var keyword = req.query.keyword;
    var re;

    var query = {
        type: 'job',
        status: 'publish',
        is_delete: false
    };
    if (req.query.type) {
        query.jobType = req.query.type;
    }
    if (req.query.years) {
        query.workYears = req.query.years;
    }
    if (req.query.payment) {
        query.payment = req.query.payment;
    }
    if (req.query.location) {
        query.location = req.query.location;
    }
    if (req.query.degree) {
        query.degree = req.query.degree;
    }
    if (req.query.keyword) {
        re = new RegExp(keyword, 'ig');
        query.$or = [{
            summary: re
        }, {
            position: re
        }];
    }
    Share.find(query).populate('user').sort('-createAt').skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, shares) {
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
                    number: item.number,
                    skills: item.skills,
                    location: item.location,
                    degree: item.degree,
                    views: item.views,
                    join: item.resumes.length,
                    type: item.jobType,
                    date: item.createAt.getTime(),
                    isSaved: false
                };
                var index = -1;
                user.collects.job.map(function(job, key) {
                    if (job.toString() == item._id.toString()) {
                        index = key;
                    }
                });
                if (index > -1) {
                    obj.isSaved = true;
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
var closeJob = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    Share.findOne({
        _id: id
    }).populate('user').exec(function(err, job) {
        if (job.user._id.toString() !== user._id) {
            return res.send({
                code: 404,
                info: 'no auth'
            });
        }
        job.status = 'close';
        job.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};
var removeJob = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    Share.findOne({
        _id: id
    }).populate('user').exec(function(err, job) {
        if (job.user._id.toString() !== user._id) {
            return res.send({
                code: 404,
                info: 'no auth'
            });
        }
        job.is_delete = true;
        job.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};
var publishJob = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    Share.findOne({
        _id: id
    }).populate('user').exec(function(err, job) {
        if (job.user._id.toString() !== user._id) {
            return res.send({
                code: 404,
                info: 'no auth'
            });
        }
        job.status = 'publish';
        job.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};
var postJob = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;

    Share.findOne({
        _id: id
    }, function(err, share) {
        if (share.user.toString() == user._id) {
            return res.send({
                code: 200,
                info: 'creator'
            });
        }
        var index = -1;
        share.resumes.map(function(item, key) {
            if (item.user.toString() == user._id) {
                index = key;
                return;
            }
        });
        if (index > -1) {
            return res.send({
                code: 200,
                info: 'has post'
            });
        }
        share.resumes.push({
            user: user._id,
            date: new Date(),
            isQuit: false
        });
        share.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};
var giveUpJob = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;

    Share.findOne({
        _id: id
    }, function(err, share) {
        var index = -1;
        share.resumes.map(function(item, key) {
            if (item.user.toString() == user._id) {
                item.isQuit = true;
                index = key;
            }
        });
        if (index === -1) {
            return res.send({
                code: 404,
                info: 'no join user'
            });
        }
        share.markModified('resumes');
        share.save(function() {
            res.send({
                code: 200
            });
        });
    });
};
var getPostJobList = function(req, res) {
    var user = req.session.user;
    var id = req.query.shareId;

    Share.findOne({
        _id: id
    }).populate('resumes.user').exec(function(err, share) {
        if (share.user.toString() !== user._id) {
            return res.send({
                code: 404,
                info: 'no auth'
            });
        }
        var results = [];
        share.resumes.map(function(item) {
            if (!item.isQuit) {
                var user = item.user;
                var obj = {
                    sex: user.sex,
                    name: user.name,
                    id: user.id,
                    _id: user._id,
                    birth: user.birth,
                    occupation: user.occupation,
                    school: user.school || 'BUPT',
                    workYear: user.workYear,
                    avatar: user.avatar
                };
                results.push(obj);
            }
        });
        res.send({
            code: 200,
            content: results
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
    app.post('/api/share/edit', middleware.check_login, editShare);
    app.get('/api/share/user', middleware.check_login, getShareByUser);
    app.get('/api/share/id/:id', getShareById);
    app.get('/api/share/comments', getShareComments);

    // comments
    app.post('/api/share/comments/add', middleware.check_login, addComment);
    app.post('/api/share/comments/delete', middleware.check_login, deleteComment);

    // jobs
    app.get('/api/job/latest', getLatestJobs);
    app.get('/api/job/search', jobsSearch);
    app.get('/api/job/postList', getPostJobList);
    app.get('/api/job/:id', getJobById);
    app.post('/api/job/close', closeJob);
    app.post('/api/job/remove', removeJob);
    app.post('/api/job/publish', publishJob);
    app.post('/api/job/post', postJob);
    app.post('/api/job/giveup', giveUpJob);
};