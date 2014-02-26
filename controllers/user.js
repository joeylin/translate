var async = require('async');
var config = require('../config');
var db = config.mysql;
var utils = require('./utils');
var check_signin = require('./check_signin');


module.exports = function(app) {

    app.all('/current_user', check_signin, function(req, res, next) {
        res.json(req.signinUser);
    });

    // 用户列表
    app.get('/user/list', function(req, res, next) {
        db.select('user_list', '`id`, `nickname`', '`is_active`=1', function(err, users) {
            if (err) return next(err);

            // 查询出用户翻译的数量及被赞的数量，赞别人的次数
            async.eachSeries(users, function(user, next) {

                var fields = 'COUNT(*) AS `count`, SUM(`vote`) AS `vote`';
                var where = '`user_id`=' + db.escape(user.id);
                db.selectOne('translate_api', fields, where, function(err, info) {
                    if (err) return next(err);

                    user.count = info.count;
                    user.vote = info.vote;

                    db.selectOne('translate_vote_history', 'COUNT(*) AS `count`', where, function(err, info) {
                        if (err) return next(err);

                        user.review = info.count;
                        next();
                    });
                });

            }, function(err) {
                if (err) return next(err);

                // 按照翻译量排序
                users.sort(function(a, b) {
                    var v = b.count - a.count;
                    if (v !== 0) return v;
                    return b.vote - a.vote;
                });

                res.locals.users = users;
                res.render('user_list');
            });
        });
    });

    // 用户翻译详细信息
    app.get('/user/id/:id', function(req, res, next) {
        var id = req.params.id;

        // 用户详细信息
        db.selectOne('user_list', '`id`, `nickname`', '`id`=' + db.escape(id), function(err, user) {
            if (err) return next(err);
            if (!user) return next('用户不存在');

            var sql = 'SELECT `A`.*, `B`.`content` AS `origin_content`, `B`.`file`, `B`.`version`, `B`.`type`' +
                ' FROM `translate_api` AS `A`' +
                ' LEFT JOIN `origin_api` AS `B`' +
                ' ON `A`.`origin_hash`=`B`.`hash`' +
                ' WHERE `user_id`=' + db.escape(id) +
                ' ORDER BY  `A`.`timestamp` DESC';
            db.query(sql, function(err, translates) {
                if (err) return next(err);

                var fields = 'COUNT(*) AS `count`, SUM(`vote`) AS `vote`';
                var where = '`user_id`=' + db.escape(user.id);
                db.selectOne('translate_api', fields, where, function(err, info) {
                    if (err) return next(err);

                    user.count = info.count;
                    user.vote = info.vote;

                    res.locals.user = user;
                    res.locals.translates = translates;
                    res.render('user');
                });
            });
        });
    });

};

// 用户翻译详细信息
exports.showUserTranslate = function(req, res) {
    res.render('sign/signup');
};

exports.signup = function(req, res, next) {};
exports.showSignin = function(req, res) {};
exports.signin = function(req, res, next) {};