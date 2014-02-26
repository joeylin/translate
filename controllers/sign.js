// sign.js

var check = require('validator').check,
    sanitize = require('validator').sanitize;

var crypto = require('crypto');
var config = require('../config').config;

var User = require('../proxy').User;

exports.showSignup = function(req, res) {
    res.render('sign/signup');
};
exports.signup = function(req, res, next) {
    var name = sanitize(req.body.name).trim();
    name = sanitize(name).xss();
    var loginname = name.toLowerCase();
    var pass = sanitize(req.body.pass).trim();
    pass = sanitize(pass).xss();
    var email = sanitize(req.body.email).trim();
    email = email.toLowerCase();
    email = sanitize(email).xss();
    var re_pass = sanitize(req.body.re_pass).trim();
    re_pass = sanitize(re_pass).xss();

    if (name === '' || pass === '' || re_pass === '' || email === '') {
        res.render('sign/signup', {
            error: '信息不完整。',
            name: name,
            email: email
        });
        return;
    }

    if (name.length < 5) {
        res.render('sign/signup', {
            error: '用户名至少需要5个字符。',
            name: name,
            email: email
        });
        return;
    }

    try {
        check(name, '用户名只能使用0-9，a-z，A-Z。').isAlphanumeric();
    } catch (e) {
        res.render('sign/signup', {
            error: e.message,
            name: name,
            email: email
        });
        return;
    }

    if (pass !== re_pass) {
        res.render('sign/signup', {
            error: '两次密码输入不一致。',
            name: name,
            email: email
        });
        return;
    }

    try {
        check(email, '不正确的电子邮箱。').isEmail();
    } catch (e) {
        res.render('sign/signup', {
            error: e.message,
            name: name,
            email: email
        });
        return;
    }

    User.getUsersByQuery({
        '$or': [{
            'loginname': loginname
        }, {
            'email': email
        }]
    }, {}, function(err, users) {
        if (err) {
            return next(err);
        }
        if (users.length > 0) {
            res.render('sign/signup', {
                error: '用户名或邮箱已被使用。',
                name: name,
                email: email
            });
            return;
        }

        // md5 the pass
        pass = md5(pass);

        User.newAndSave(name, loginname, pass, email false, function(err) {
            if (err) {
                return next(err);
            }
            res.render('sign/signup', {
                success: '欢迎加入 ' + config.name + '！我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。'
            });
        });
    });
};
exports.showSignin = function(req, res) {
    res.render('signin');
};
exports.signin = function(req, res, next) {
    var loginname = sanitize(req.body.name).trim().toLowerCase();
    var pass = sanitize(req.body.pass).trim();

    if (!loginname || !pass) {
        return res.render('sign/signin', {
            error: '信息不完整。'
        });
    }

    User.getUserByLoginName(loginname, function(err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render('sign/signin', {
                error: '这个用户不存在。'
            });
        }
        pass = md5(pass);
        if (pass !== user.pass) {
            return res.render('sign/signin', {
                error: '密码错误。'
            });
        }
        // store session cookie
        gen_session(user, res);

        res.redirect(req.query.url || 'home');
    });
};
exports.signout = function(req, res, next) {
    req.session.destroy();
    res.clearCookie(config.auth_cookie_name, {
        path: '/'
    });
    res.redirect(req.query.url || 'home');
};
exports.gen_session = gen_session;

// private
function gen_session(user, res) {
    var auth_token = encrypt(user._id + '\t' + user.name + '\t' + user.pass + '\t' + user.email, config.session_secret);
    res.cookie(config.auth_cookie_name, auth_token, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 30
    }); //cookie 有效期30天
}

function encrypt(str, secret) {
    var cipher = crypto.createCipher('aes192', secret);
    var enc = cipher.update(str, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
}

function decrypt(str, secret) {
    var decipher = crypto.createDecipher('aes192', secret);
    var dec = decipher.update(str, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

function md5(str) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
}

function randomString(size) {
    size = size || 6;
    var code_string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var max_num = code_string.length + 1;
    var new_pass = '';
    while (size > 0) {
        new_pass += code_string.charAt(Math.floor(Math.random() * max_num));
        size--;
    }
    return new_pass;
}