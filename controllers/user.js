var Models = require('../models');
var Doc = Models.Doc;
var Chapter = Models.Chapter;
var Section = Models.Section;
var Translate = Models.Translate;
var User = Models.User;

var create = function(req, res) {
    var options = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    };
    var user = new User(options);
    console.log(user);
    user.provider = 'local';
    user.save(function(err, user) {
        if (err) {
            var message = err.message;
            return res.send({
                code: 404,
                user: null,
                info: message
            });
        }
        console.log(user);
        req.session.user = {
            uid: user._id,
            username: user.username,
            display_name: user.display_name,
            email: user.email,
            avatar: user.avatar,
            isActive: user.isActive
        };
        res.send({
            code: 200,
            user: req.session.user
        });
    });
};
var login = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    User.findOne({
        username: username
    }, function(err, user) {
        if (err) {
            console.log('xxxnone users');
            return false;
        }
        if (!user) {
            return res.send({
                code: 404,
                user: null,
                info: 'unkown user'
            });
        }
        if (!user.authenticate(password)) {
            return res.send({
                code: 404,
                user: null,
                info: 'error user or password'
            });
        }
        req.session.user = {
            uid: user._id,
            username: user.username,
            display_name: user.display_name,
            email: user.email,
            avatar: user.avatar,
            isActive: user.isActive
        };
        res.send({
            code: 200,
            user: req.session.user
        });
    });
};
var logout = function(req, res) {
    req.session.destroy();
    res.send({
        code: 200,
        user: null
    });
};
var findUser = function(req, res) {
    var id = req.body.id;
    User.findOne({
        _id: id
    }).exec(function(err, user) {
        if (err) {
            console.log('err find');
        }
        if (!user) {
            return res.send({
                status: false,
                info: 'unkown user'
            });
        } else {
            res.send({
                status: true,
                user: user
            });
        }
    });
};

exports.create = create;
exports.show = findUser;
exports.login = login;
exports.logout = logout;