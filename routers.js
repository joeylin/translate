/**
 * Module dependencies.
 */


var sign = require('./controllers/sign');
var auth = require('./middlewares/auth');


module.exports = function(app) {

    // users
    app.get('/signup', function(req, res, next) {
        res.render('signup');
    });
    app.post('/signup', function(req, res, next) {
        var email = req.body.email;
        var password = req.body.password;
        var nickname = req.body.nickname;
        if (!email) return showError('请填写邮箱地址');
        if (!password) return showError('请填写密码');
        if (!nickname) nickname = email.split('@')[0];

        function showError(err) {
            res.locals.email = email;
            res.locals.password = password;
            res.locals.nickname = nickname;
            res.locals.error = err.toString();
            res.render('signup');
        }

        db.selectOne('user_list', '*', '`email`=' + db.escape(email), function(err, user) {
            if (err) return showError(err);
            if (user) return showError('该邮箱地址已注册过了，请选择其它邮箱地址！');

            db.insert('user_list', {
                email: email,
                password: utils.encryptPassword(password),
                nickname: nickname,
                is_active: 1
            }, function(err) {
                if (err) return showError(err);

                res.redirect('/signin');
            });
        });
    });
    app.get('/signin', function(req, res, next) {
        res.render('signin');
    });
    app.post('/signin', function(req, res, next) {
        var email = req.body.email;
        var password = req.body.password;
        if (!email) return showError('请填写邮箱地址');
        if (!password) return showError('请填写密码');

        function showError(err) {
            res.locals.email = email;
            res.locals.password = password;
            res.locals.error = err.toString();
            res.render('signin');
        }

        db.selectOne('user_list', '*', '`email`=' + db.escape(email), function(err, user) {
            if (err) return showError(err);
            if (!user) return showError('用户不存在');

            if (utils.validatePassword(password, user.password)) {
                var data = utils.encryptData({
                    id: user.id,
                    n: user.nickname
                }, config.signin.secret);
                res.cookie('signin', data, {
                    path: '/',
                    maxAge: config.signin.maxAge
                });
                res.redirect(req.query.url || '/api/');
            } else {
                showError('密码不正确');
            }
        });
    });
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
    // 网站首页
    app.get('/', function(req, res, next) {
        req.url = '/public/index.html';
        app(req, res);
    });
    // 浏览指定API页面
    app.get('/api/:name.:type', function(req, res, next) {
        var name = req.params.name;
        var type = req.params.type;

        utils.readAPIFile(name, function(err, content, filename) {
            if (err) return next(err);
            if (type === 'html') {
                api2HTML(content, filename, utils.TEMPLATE_FILE, function(err, html) {
                    if (err) return next(err);
                    res.writeHead(200, {
                        'content-type': 'text/html'
                    });
                    res.end(html);
                });
            } else if (type === 'json') {
                api2JSON(content, filename, function(err, data) {
                    if (err) return next(err);
                    res.json(data);
                })
            } else {
                res.writeHead(200, {
                    'content-type': 'text/plain'
                });
                res.end(content);
            }
        });
    });
    // API首页
    app.get('/api', function(req, res, next) {
        req.url = '/api/index.html';
        app(req, res);
    });
    // 翻译进度
    app.get('/progress', function(req, res, next) {
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
    });
    app.get('/help/:page', function(req, res, next) {
        var page = req.params.page;
        fs.readFile(path.resolve(HEPL_PATH, page + '.md'), 'utf8', function(err, content) {
            if (err) return next(err);

            var html = xss(marked(content));
            res.locals.body = html;
            res.render('help');
        });
    });
    app.get('/edit/:name', check_signin, function(req, res, next) {
        var name = req.params.name;
        if (name === 'index') name = '_toc';

        var where = '`file`=' + db.escape(name) +
            ' AND `version`=' + db.escape(config.api.version) +
            ' AND `type`!="meta"';
        db.select('origin_api', '*', where, 'ORDER BY `id` ASC', function(err, lines) {
            if (err) return next(err);

            // 查找出所有用户的翻译
            async.eachSeries(lines, function(line, next) {
                line.rows = line.content.split('\n').length;

                var where = '`origin_hash`=' + db.escape(line.hash);
                db.select('translate_api', '*', where, 'ORDER BY `timestamp` ASC', function(err, translates) {
                    if (err) return next(err);

                    // 如果当前用户曾经翻译过此项，则自动填写上去
                    for (var i = 0; i < translates.length; i++) {
                        if (translates[i].user_id == req.signinUser.id) {
                            line.current = translates[i];
                            //translates.splice(i, 1);
                            break;
                        }
                    }

                    line.translates = translates;
                    next();
                });
            }, function(err) {
                if (err) return next(err);

                // 查询出所有相关用户的信息
                var users = {};
                lines.forEach(function(line) {
                    line.translates.forEach(function(t) {
                        users[t.user_id] = {};
                    });
                });
                async.eachSeries(Object.keys(users), function(uid, next) {

                    db.selectOne('user_list', '`id`, `email`, `nickname`', '`id`=' + db.escape(uid), function(err, user) {
                        if (err) return next(err);
                        if (!user) {
                            user = {
                                id: 0,
                                email: '',
                                nickname: '用户不存在'
                            };
                        }
                        users[uid] = user;
                        next();
                    });
                }, function(err) {
                    if (err) return next(err);

                    res.locals.users = users;
                    res.locals.lines = lines;
                    res.render('edit');
                });
            });
        });
    });
    app.post('/translate/save', check_signin, function(req, res, next) {
        var hash = req.body.hash;
        var content = req.body.content;
        var user_id = req.signinUser.id;
        if (!(hash && hash.length === 32)) return res.json({
            error: 'hash参数有误'
        });
        if (!content) return res.json({
            error: '翻译后的内容不能为空'
        });
        hash = hash.toLowerCase();

        // 由于 &gt; 和 &lt; 转换会 > 和 <
        content = content.replace(/&gt;/g, '>').replace(/&lt;/, '<');

        // 检查修改后的内容，应尽量保留原有的格式
        db.selectOne('origin_api', '*', '`hash`=' + db.escape(hash), function(err, origin) {
            if (err) return res.json({
                error: err.toString()
            });
            if (!origin) return res.json({
                error: '要翻译的条目不存在'
            });

            function formatError(err) {
                res.json({
                    error: '翻译时请保留原来的格式：' + err
                });
            }

            // 检查格式是否一致
            if (origin.type === 'title') {
                var i = origin.content.indexOf(' ');
                var j = content.indexOf(' ');
                if (i !== j) return formatError('标题前面应该有' + i + '个#后面再跟一个空格');
            } else if (origin.type === 'code') {
                var lines = content.split(/\r?\n/);
                var originLines = origin.content.split(/\r?\n/);
                if (originLines[0].substr(0, 3) === '```') {
                    if (!(lines[0].substr(0, 3) === '```' && lines[lines.length - 1].trimRight() === '```')) {
                        return formatError('代码块的首行和尾行必须是```');
                    }
                } else {
                    for (var i = 0; i < lines.length; i++) {
                        if (lines[i].substr(0, 4) !== '    ') {
                            return formatError('（第' + (i + 1) + '行）代码块的每一行应该以4个空格开头');
                        }
                    }
                }
            }

            // 保存修改结果
            var where = '`origin_hash`=' + db.escape(hash) + ' AND `user_id`=' + db.escape(user_id);
            db.selectOne('translate_api', '*', where, function(err, item) {
                if (err) return res.json({
                    error: err.toString()
                });

                function callback(err, ret) {
                    if (err) return res.json({
                        error: err.toString()
                    });
                    if (ret.affectedRows > 0 || ret.insertId > 0) {
                        res.json({
                            success: 1
                        });
                    } else {
                        res.json({
                            success: 0
                        });
                    }
                }

                if (item) {
                    db.update('translate_api', 'id=' + db.escape(item.id), {
                        content: content,
                        timestamp: db.timestamp()
                    }, callback);
                } else {
                    db.insert('translate_api', {
                        user_id: user_id,
                        origin_hash: hash,
                        content: content,
                        timestamp: db.timestamp()
                    }, callback);
                }
            });
        });
    });
    app.post('/translate/vote', check_signin, function(req, res, next) {
        var id = req.body.id;
        if (!(id > 0)) return res.json({
            error: 'id参数有误'
        });

        var user_id = req.signinUser.id;
        var where = '`translate_id`=' + db.escape(id) + ' AND `user_id`=' + db.escape(user_id);
        db.selectOne('translate_vote_history', '*', where, function(err, vote) {
            if (err) return res.json({
                error: err.toString()
            });
            if (vote) return res.json({
                success: 0
            });

            db.insert('translate_vote_history', {
                translate_id: id,
                user_id: user_id,
                timestamp: db.timestamp()
            }, function(err, ret) {
                if (err) return res.json({
                    error: err.toString()
                });

                var sql = 'UPDATE `translate_api` SET `vote`=`vote`+1 WHERE `id`=' + db.escape(id);
                db.query(sql, function(err, ret) {
                    if (err) return res.json({
                        error: err.toString()
                    });

                    res.json({
                        success: ret.affectedRows
                    });
                });
            });
        });
    });
    // 取指定段落的原文
    app.get('/translate/get/origin', function(req, res, next) {
        var hash = req.query.hash;
        if (!hash) return res.json({
            error: 'hash参数有误'
        });

        var where = '`hash`=' + db.escape(hash);
        db.selectOne('origin_api', '*', where, function(err, ret) {
            if (err) return res.json({
                error: err.toString()
            });
            if (!ret) return res.json({
                error: '该段落不存在'
            });

            ret.html = utils.markdownToHTML(ret.content);
            res.json(ret);
        });
    });
};