var Models = require('../models');
var Job = Models.Job;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Share = Models.Share;
var Request = Models.Request;
var Group = Models.Group;
var Invitation = Models.Invitation;
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
        if (!group) {
            return res.send({
                code: 404,
                info: 'out of group limit'
            });
        }
        res.send({
            code: 200,
            groupId: group.id
        });
    });
};
var joinRequest = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    var content = req.body.content;
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
                    content: content,
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
        if (request.to.toString() !== user._id) {
            return res.send({
                code: 404,
                info: 'no auth'
            });
        }
        if (request.hasDisposed) {
            return res.send({
                code: 200,
                info: 'others checked'
            });
        }
        var options = {
            multi: true
        };
        if (value) {
            Group.join(request.group, request.from.toString(), function(err, group) {
                if (!group) {
                    return res.send({
                        code: 200,
                        info: err.msg
                    });
                }
                Request.update({
                    from: request.from,
                    group: request.group
                }, {
                    $set: {
                        hasDisposed: true,
                        isPass: true
                    }
                }, options, function(err, num) {
                    res.send({
                        code: 200
                    });
                    var obj = {
                        to: request.from,
                        group: request.group,
                        title: 'member'
                    };
                    Request.notice(obj);
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
            }, options, function(err) {
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
var follow = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    User.findOne({
        _id: user._id
    }).exec(function(err, user) {
        var follow = user.groups.follow;
        var index = -1;
        follow.map(function(item,key) {
            if (item.toString() == id) {
                index = -1;
                return false;
            }
        }); 
        if (index > -1) {
            return res.send({
                code: 404,
                info: 'has followed'
            });
        } 
        user.groups.follow.push(id);
        user.markModified('user.groups.follow');
        user.save(function(err, user) {
            Group.findOne({
                _id: id
            }).exec(function(err, group) {
                group.followCount += 1;
                group.save(function(err) {
                    res.send({
                        code: 200
                    });
                });
            }); 
        });
    });
};
var unfollow = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    User.findOne({
        _id: user._id
    }, function(err, user) {
        var index = -1;
        user.groups.follow.map(function(item, key) {
            if (item.toString() == id) {
                index = key;
                return false;
            }
        });
        if (index === -1) {
            return res.send({
                code: 404,
                info: 'no followed'
            });
        }
        user.groups.follow.splice(index, 1);
        user.markModified('user.groups.follow');
        user.save(function(err) {
            Group.findOne({
                _id: id
            }).exec(function(err, group) {
                group.followCount -= 1;
                group.save(function(err) {
                    res.send({
                        code: 200
                    });
                });
            }); 
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
        if (!group) {
            return res.send({
                code: 404
            });
        }
        if (group.isAdmin(user._id) || group.isCreator(user._id)) {
            group.deleteMember(deleteId, function(err, group) {
                res.send({
                    code: 200
                });
            });
        } else {
            res.send({
                code: 404
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
        if (!group) {
            return res.send({
                code: 404,
                info: 'no specified group'
            });
        }
        if (group.isCreator(user._id)) {
            group.deleteAdmin(deleteId, function(err, group) {
                res.send({
                    code: 200
                });
            });
        } else {
            res.send({
                code: 404
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
        if (!group) {
            res.send({
                code: 404,
                info: 'no group'
            });
        }
        if (group.admin.length > 5) {
            return res.send({
                code: 404,
                info: 'bound of limit'
            });
        }
        if (!group.isCreator(user._id)) {
            return res.send({
                code: 404,
                info: 'no auth'
            });
        }
        group.addAdmin(adminId, function(err, group) {
            res.send({
                code: 200
            });
            var obj = {
                to: adminId,
                group: group._id,
                title: 'admin'
            };
            Request.notice(obj, function(err, request) {
                console.log(err, request);
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
                content: [],
                hasNext: false,
                count: 0,
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
                result.commentsCount = item.comments.length;
                result.content = item.content;
                result.createAt = item.createAt.getTime();
                result.id = item.id;
                result.fork = item.fork;
                result.isFork = item.isFork;
                if (item.isFork) {
                    result.from = {
                        user: {
                            name: item.from.user.name,
                            id: item.from.user.id,
                            _id: item.from.user._id
                        },
                        share: {
                            createAt: item.from.share.createAt,
                            content: item.from.share.content,
                            _id: item.from.share._id
                        }
                    };
                    if (item.from.group) {
                        result.from.group = {
                            name: item.from.group.name,
                            id: item.from.group.id,
                            _id: item.from.group._id
                        };
                    }
                }
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
                result.has_collect = false;
                if (user) {
                    item.collects.map(function(collect) {
                        if (collect.user.toString() == user._id.toString()) {
                            result.has_collect = true;
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
    var intro = req.body.intro;

    Group.findOne({
        _id: id
    }, function(err, group) {
        if (!group.isCreator(user._id) && !group.isAdmin(user._id)) {
            return res.send({
                code: 404,
                info: 'no auth'
            });
        }
        group.name = name;
        group.announcement = announcement;
        group.industry = industry;
        group.intro = intro;
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
        if (!group.isCreator(user._id) && !group.isAdmin(user._id)) {
            return res.send({
                code: 404,
                info: 'no auth'
            });
        }
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
                isAdmin: false
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
var deleteShare = function(req, res) {
    var user = req.session.user;
    var shareId = req.body.shareId;
    Share.findOne({
        _id: shareId
    }).populate('group').exec(function(err, share) {
        if (!share.group.isAdmin(user._id) && !share.group.isCreator(user._id)) {
            return res.send({
                code: 404
            });
        }
        share.is_delete = true;
        share.save(function(err, share) {
            res.send({
                code: 200
            });
        });
    });
};
var getMembersList = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    Group.findOne({
        _id: id
    }).populate('members').populate('creator').populate('admin').exec(function(err, group) {
        if (!group) {
            return res.send({
                code: 404,
                info: 'no group'
            });
        }
        var result = [];
        result.push(group.creator.name);
        group.admin.map(function(item, key) {
            result.push(item.name);
        });
        group.members.map(function(item, key) {
            result.push(item.name);
        });
        res.send({
            code: 200,
            list: result
        });
    });
};
var searchGroup = function(req, res) {
    var user = req.session.user;
    var page = req.query.page || 1;
    var perPageItems = 30;
    var keyword = req.query.keyword;
    var isMe = !! req.query.isMe;
    var query = {};

    var id = parseInt(keyword, 10);
    if (id) {
        query.id = id;
        isMe = false;
    } else {
        re = new RegExp(keyword, 'ig');
        query.$or = [{
            name: re
        }, {
            industry: re
        }];
    }
    if (isMe) {
        User.findOne({
            _id: user._id
        }).exec(function(err, user) {
            var array = [];
            var joinGroups = user.groups.join;
            joinGroups.map(function(item) {
                array.push(item.toString());
            });
            query._id = {
                $in: array
            };
            Group.find(query).skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, groups) {
                Group.find(query).count().exec(function(err, count) {
                    var results = [];
                    var hasNext;
                    groups.map(function(group) {
                        var result = {
                            avatar: group.avatar,
                            id: group.id,
                            _id: group._id,
                            industry: group.industry,
                            name: group.name,
                            followCount: group.followCount,
                            count: group.count
                        };
                        results.push(result);
                    });

                    if ((page - 1) * perPageItems + results.length < count) {
                        hasNext = true;
                    } else {
                        hasNext = false;
                    }
                    res.send({
                        code: 200,
                        content: results,
                        count: count,
                        hasNext: hasNext,
                    });
                });
            });
        });
    } else {
        Group.find(query).skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, groups) {
            Group.find(query).count().exec(function(err, count) {
                var results = [];
                var hasNext;
                groups.map(function(group) {
                    var result = {
                        avatar: group.avatar,
                        id: group.id,
                        _id: group._id,
                        industry: group.industry,
                        name: group.name,
                        followCount: group.followCount,
                        count: group.count
                    };
                    results.push(result);
                });

                if ((page - 1) * perPageItems + results.length < count) {
                    hasNext = true;
                } else {
                    hasNext = false;
                }
                res.send({
                    code: 200,
                    content: results,
                    count: count,
                    hasNext: hasNext,
                });
            });
        });
    }
};
var groupHomeSearch = function(req, res) {
    var page = req.query.page || 1;
    var perPageItems = 20;
    var keyword = req.query.keyword;
    var query = {
        is_delete: false
    };

    if (!keyword) {
        return res.send({
            code: 404,
        });
    }

    var id = parseInt(keyword, 10);

    var str = '';
    var array = keyword.split(' ');
    array.map(function(item,key) {
        str += item;
        if (key !== array.length - 1 ) {
            str += '|';
        }
    });
    if (id) {
        query.id = id;
    } else {
        var re = new RegExp(str, 'ig');
        query.$or = [{
            name: re
        }, {
            industry: re
        }];
    }
        
    Group.find(query).skip((page - 1) * perPageItems)
    .limit(perPageItems).exec(function(err, groups) {
        Group.find(query).count().exec(function(err, count) {
            var results = [];
            var hasNext;
            groups.map(function(group) {
                var result = {
                    avatar: group.avatar,
                    id: group.id,
                    _id: group._id,
                    industry: group.industry,
                    name: group.name,
                    count: group.count,
                    intro: group.intro,
                    followCount: group.followCount
                };
                results.push(result);
            });

            if ((page - 1) * perPageItems + results.length < count) {
                hasNext = true;
            } else {
                hasNext = false;
            }
            res.send({
                code: 200,
                content: results,
                count: count,
                hasNext: hasNext,
            });
        });
    });
};
var groupPostSearch = function(req, res) {
    var user = req.session.user;
    var id = req.params.id;
    var page = req.query.page || 1;
    var keyword = req.query.keyword;
    var size = req.query.size || 20;

    if (!keyword) {
        return res.send({
            code: 200,
            count: 0,
            hasNext: false,
            content: [],
            info: 'no keyword'
        });
    }

    var re = new RegExp(keyword, 'ig');

    Share.find({
        group: id,
        content: re,
        is_delete: false
    }).sort({
        createAt: -1
    }).populate('user').skip((page - 1) * size).limit(size).exec(function(err, trends) {
        if (!trends) {
            return res.send({
                code: 200,
                content: [],
                hasNext: false,
                count: 0,
                info: 'no share'
            });
        }
        Share.find({
            group: id,
            content: re,
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
var getTrends = function(req, res) {
    var user = req.session.user;
    var page = req.query.page || 1;
    var size = req.query.size || 20;

    User.findOne({
        _id: user._id
    }).exec(function(err, user) {
        var follow = [];
        user.groups.follow.map(function(item) {
            follow.push(item.toString());
        });
        var query = {
            group: {
                $in: follow
            },
            is_delete: false
        };
        Share.find(query).populate('user').populate('group').populate('from.share')
        .populate('from.user')
        .populate('from.group')
        .sort('-createAt').skip((page - 1) * size).limit(size).exec(function(err, shares) {
            if (!shares) {
                return res.send({
                    code: 200,
                    content: [],
                    hasNext: false,
                    count: 0,
                    info: 'no share'
                });
            }
            Share.find(query).count().exec(function(err, count) {
                var content = [];
                var hasNext;
                shares.map(function(item, key) {
                    var result = {};
                    result.type = 'view';
                    result._id = item._id;
                    result.commentsCount = item.comments.length;
                    result.content = item.content;
                    result.createAt = item.createAt.getTime();
                    result.id = item.id;
                    result.fork = item.fork;
                    result.user = {
                        name: item.user.name,
                        avatar: item.user.avatar,
                        _id: item.user._id,
                        id: item.user.id
                    };
                    result.isFork = item.isFork;
                    if (item.isFork) {
                        result.from = {
                            user: {
                                name: item.from.user.name,
                                id: item.from.user.id,
                                _id: item.from.user._id
                            },
                            share: {
                                createAt: item.from.share.createAt,
                                content: item.from.share.content,
                                _id: item.from.share._id
                            }
                        };
                        if (item.from.group) {
                            result.from.group = {
                                name: item.from.group.name,
                                id: item.from.group.id,
                                _id: item.from.group._id
                            };
                        }
                    }
                    result.group = {
                        name: item.group.name,
                        id: item.group.id,
                        _id: item.group._id,
                        avatar: item.group.avatar
                    };
                    result.liked = false;
                    if (user) {
                        item.likes.map(function(like) {
                            if (like.toString() == user._id.toString()) {
                                result.liked = true;
                            }
                        });
                    }
                    result.has_collect = false;
                    if (user) {
                        item.collects.map(function(collect) {
                            if (collect.user.toString() == user._id.toString()) {
                                result.has_collect = true;
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
                user.visit.groupTrends = new Date();
                user.save(function(err) {
                    res.send({
                        code: 200,
                        count: count,
                        hasNext: hasNext,
                        content: content
                    });
                });
            });
        });
    });
};

var getHire = function(req, res) {
    var user = req.session.user;
    var id = req.query.id;

    Group.findOne({
        id: id
    }).populate('hire.by').exec(function(err, group) {
        if (!group) {
            return res.send({
                code: 404,
                info: 'wrong id'
            });
        }
        var hire = [];
        if (group.hire.length) {
            group.hire.slice(0, 5).map(function(item ,key) {
                var result = {
                    location: item.location,
                    position: item.position,
                    link: item.link,
                    by: {
                        name: item.by.name,
                        id: item.by.id
                    },
                    date: item.date
                };
                hire.push(result);
            });
        }
        res.send({
            code: 200,
            hire: hire
        });
    });
};
var addHire = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    var location = req.body.location;
    var position = req.body.position;
    var by = req.body.by;
    var link = req.body.link;

    if (!location || !position || !link) {
        return res.send({
            code: 404,
            info: 'incomplete info'
        });
    }

    Group.findOne({
        id: id
    }).exec(function(err, group) {
        if (!group) {
            return res.send({
                code: 404,
                info: 'no group'
            });
        }
        var admin = group.admin;
        var creator = group.creator;
        var auth = false;
        [creator].concat(admin).map(function(item, key) {
            if (item.toString() == user._id) {
                return auth = true;
            }
        });
        if (!auth) {
            return res.send({
                code: 404,
                info: 'no auth'
            });
        }
        if (group.hire.length >= 5) {
            return res.send({
                code: 404,
                info: 'max hire number'
            });
        }
        group.hire.push({
            location: location,
            position: position,
            link: link,
            by: by,
            date: new Date()
        });
        group.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};
var delHire = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    var location = req.body.location;
    var position = req.body.position;
    var link = req.body.link;

    Group.findOne({
        id: id
    }).exec(function(err, group) {
        if (!group) {
            return res.send({
                code: 404,
                info: 'no group'
            });
        }
        var admin = group.admin;
        var creator = group.creator;
        var auth = false;
        [creator].concat(admin).map(function(item, key) {
            if (item.toString() == user._id) {
                auth = true;
                return false;
            }
        });
        if (!auth) {
            return res.send({
                code: 404,
                info: 'no auth'
            });
        }
        var index = -1;
        group.hire.map(function(item, key) {
            if (item.location == location && item.position == position && item.link == link) {
                index = key;
            }
        });
        if (index === -1) {
            return res.send({
                code: 200,
                info: 'had delete'
            });
        }
        group.hire.splice(index, 1);
        group.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};

// invite code
var getGroupInviteCode = function(req, res) {
    var user = req.session.user;
    var id = req.query.id;
    Group.findOne({
        id: id
    }).exec(function(err, group) {
        if (!group) {
            return res.send({
                code: 200,
                info: 'no group'
            });
        }
        Invitation.find({
            group: group._id
        }).exec(function(err, invites) {
            var used = 0;
            var unUsed = [];
            invites.map(function(item, key) {
                if (item.is_delete) {
                    used++;
                } else {
                    unUsed.push({
                        code: item.code
                    });
                }
            });
            res.send({
                code: 200,
                total: 10,
                used: used,
                unUsed: unUsed
            });
        });
    })
};
var groupGenerateCode = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    var type = req.body.type;
    Group.findOne({
        id: id
    }).exec(function(err, group) {
        if (!group) {
            return res.send({
                code: 404,
                info: 'no group'
            });
        }
        var codeCount = group.codeCount || 10;
        if (group.isCreator(user._id) && group.isAdmin(user._id)) {
            Invitation.find({
                group: group._id
            }).exec(function(err, invites) {
                if (!invites) {
                    return res.send({
                        code: 404,
                        info: 'error happens'
                    })
                }
                if (invites && invites.length > codeCount) {
                    return res.send({
                        code: 200,
                        msg: 1,
                        info: 'max invite'
                    });
                }
                Invitation.createNew({
                    group: group._id,
                    user: user._id,
                    type: type
                }, function(err, invite) {
                    res.send({
                        code: 200,
                        inviteCode: invite.code
                    });
                });
            });
        } else {
            res.send({
                code: 404,
                info: 'no group auth'
            });
        }
    })
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

var openTags = function(req, res) {
    var user = req.session.user;
    var id = req.body.id;
    Group.findOne({
        id: id
    }).exec(function(err, group) {
        if (!group) {
            return res.send({
                code: 404,
                info: 'no group'
            });
        }
        var admin = group.admin;
        var creator = group.creator;
        var auth = false;
        [creator].concat(admin).map(function(item, key) {
            if (item.toString() == user._id) {
                return auth = true;
            }
        });
        if (!auth) {
            return res.send({
                code: 404,
                info: 'no auth'
            });
        }
        group.isOpenTags = true;
        group.save(function(err) {
            res.send({
                code: 200
            });
        });
    });
};


module.exports = function(app) {
    app.post('/api/group/create', middleware.apiLogin, create);
    app.post('/api/group/joinRequest', middleware.apiLogin, joinRequest);
    app.post('/api/group/checkRequest', middleware.apiLogin, checkRequest);
    app.post('/api/group/join', middleware.apiLogin, join);
    app.post('/api/group/follow', middleware.apiLogin, follow);
    app.post('/api/group/unfollow', middleware.apiLogin, unfollow);
    app.post('/api/group/quit', middleware.apiLogin, quit);
    app.post('/api/group/member/delete', middleware.apiLogin, memberDelete);
    app.post('/api/group/admin/delete', middleware.apiLogin, adminDelete);
    app.post('/api/group/admin/add', middleware.apiLogin, adminAdd);
    app.post('/api/group/settings/basic', middleware.apiLogin, setBasic);
    app.post('/api/group/settings/avatar', middleware.apiLogin, setAvatar);
    app.post('/api/group/members', getMembers);
    app.post('/api/group/list', getMembersList);
    app.get('/api/group/search', middleware.apiLogin, searchGroup);
    app.get('/api/group/homeSearch', groupHomeSearch);
    app.get('/api/group/trends', middleware.apiLogin, getTrends);

    app.post('/api/group/addHire', middleware.apiLogin, addHire);
    app.post('/api/group/delHire', middleware.apiLogin, delHire);
    app.get('/api/group/getHire', middleware.apiLogin, getHire);

    app.get('/api/group/getGroupCode', middleware.apiLogin, getGroupInviteCode);
    app.post('/api/group/generateCode', middleware.apiLogin, groupGenerateCode);

    app.get('/api/group/:id/post', getPost);
    app.get('/api/group/:id/search', groupPostSearch);
    app.post('/api/group/post/delete', middleware.apiLogin, deleteShare);

    app.post('/api/group/apply', middleware.apiLogin, apply);
};