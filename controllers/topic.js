// show process
// show topic
// show collect
var async = require('async');
var api2HTML = require('./to_html');
var api2JSON = require('../origin/tools/json');
var utils = require('./utils');
var config = require('../config');
var db = config.mysql;


var sanitize = require('validator').sanitize;

var Topic = require('../proxy').Topic;
var Util = require('../libs/util');



exports.showTopicList = function(req, res, next) {
    Topic.getSpecTopic(10, 0, function(err, topics) {
        if (err) {
            return next(err);
        }
        res.locals.topics = topics;
        res.render('topicList');
    });
};
exports.showTopic = function(req, res, next) {
    var id =
};
exports.createTopic = function(req, res, next) {
    var title = sanitize(req.body.title).trim();
    title = sanitize(title).xss();
    var content = req.body.t_content;

    var edit_error =
        title === '' ?
        '标题不能是空的。' :
        (title.length >= 10 && title.length <= 100 ? '' : '标题字数太多或太少。');
    if (edit_error) {
        res.render('topic/edit', {
            edit_error: edit_error,
            title: title,
            content: content
        });
    } else {
        Topic.newAndSave(title, content, req.session.user._id, function(err, topic) {
            if (err) {
                return next(err);
            }
            res.redirect('/topic/' + topic._id);
        });
    }
};
exports.showCreateTopic = function(req, res) {
    res.render('newTopic');
};
exports.deleteTopic = function(req, res, next) {
    var title = sanitize(req.body.title).trim();
    title = sanitize(title).xss();

    Topic.remove(title, req.session.user._id, function(err) {
        if (err) {
            return next(err);
        }
        res.redirect('/topic');
    });
    Topic.remove(req.body.title, req.session.user._id, function(err) {
        if (err) {
            return next(err);
        }
        res.redirect('/topic');
    });
};
exports.showCollect = function(req, res, next) {

};
exports.createCollect = function(req, res, next) {};
exports.showProcess = function(req, res, next) {
    // 查询出所有的文件名
    db.select('origin_api', 'file', '`version`=' + db.escape(config.api.version), 'GROUP BY `file`', function(err, files) {
        if (err) return next(err);
        files = files.map(function(f) {
            return f.file;
        });

        // 分别获取每个文件的翻译进度
        var results = [];
        var userIds = {};
        async.eachSeries(files, function(f, next) {
            var sql = 'SELECT `A`.`hash`,`B`.`user_id`' +
                ' FROM `origin_api` AS `A`' +
                ' LEFT JOIN `translate_api` AS `B`' +
                ' ON `A`.`hash`=`B`.`origin_hash`' +
                ' WHERE `file`=' + db.escape(f) +
                ' AND `type`!="meta"' +
                ' AND `version`=' + db.escape(config.api.version) +
                ' GROUP BY `A`.`hash`';
            db.query(sql, function(err, list) {
                if (err) return next(err);

                var lines = {};
                var users = {};
                list.forEach(function(line) {
                    var uid = line.user_id;
                    var hash = line.hash;
                    if (uid > 0) {
                        userIds[uid] = true;
                        // 记录用户翻译的数量
                        if (uid in users) {
                            users[uid]++
                        } else {
                            users[uid] = 1;
                        }
                        // 记录已经完成的数量
                        if (hash in lines) {
                            lines[hash]++;
                        } else {
                            lines[hash] = 1;
                        }
                    } else {
                        lines[hash] = 0;
                    }
                });

                var count = 0;
                var finish = 0;
                for (var i in lines) {
                    count++;
                    if (lines[i] > 0) finish++;
                }

                // 用户按照翻译数量排序
                var userList = [];
                for (var i in users) {
                    userList.push({
                        user_id: i,
                        count: users[i]
                    });
                }
                userList.sort(function(a, b) {
                    return b.count - a.count;
                });

                results.push({
                    name: f,
                    count: count,
                    finish: finish,
                    percent: finish / count,
                    users: userList
                });

                next();
            });

        }, function(err) {
            if (err) return next(err);

            // 获取相关用户信息
            var users = {};
            async.eachSeries(Object.keys(userIds), function(uid, next) {

                db.selectOne('user_list', '`id`,`nickname`', '`id`=' + db.escape(uid), function(err, user) {
                    if (err) return next(err);
                    if (!user) user = {
                        id: 0,
                        nickname: '该用户不存在'
                    };
                    users[uid] = user;
                    next();
                });

            }, function(err) {
                if (err) return next(err);

                // 按照完成量排序
                results.sort(function(a, b) {
                    return b.percent - a.percent;
                });

                res.locals.files = results;
                res.locals.users = users;
                res.render('progress');
            });
        });
    });

    var title = req.param.title;
    Topic.getTopicByTitle(title, function(err, topic) {
        if (err) return next(err);

    });
};