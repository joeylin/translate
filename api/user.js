var Models = require('../models');
var Job = Models.Job;
var Company = Models.Company;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Share = Models.Share;

var create = function(req, res) {
    var options = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    };
    var user = new User(options);
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
        req.session.user = {
            uid: user._id,
            username: user.username,
            display_name: user.display_name,
            email: user.email,
            avatar: user.avatar,
            isActive: user.isActive,
            des: user.des
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
            isActive: user.isActive,
            des: user.des
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
var editBasic = function(req, res) {
	var user = req.session.user;
	var display_name = req.body.display_name;
	var email = req.body.email;
	var des = req.body.res;
	User.find({
		_id: user.uid
	}, function(err, user) {
		var _user = user[0];
		_user.display_name = display_name;
		_user.email = email;
		_user.des = des;
		_user.save(function(err) {
			req.session.user = {
	            uid: _user._id,
	            username: _user.username,
	            display_name: _user.display_name,
	            email: _user.email,
	            avatar: _user.avatar,
	            isActive: _user.isActive,
	            des: _user.des
	        };
			res.send({
				code: 200,
				user: _user
			});
		});
	});
};
var editPassword = function(req, res) {
	var user = req.session.user;
	var origin = req.body.originPassword;
	var password = req.body.newPassword;
	User.find({
		_id: user.uid
	}, function(err, user) {
		var _user = user[0];
		if (!_user.authenticate(password)) {
			res.send({
				code: 404,
				info: 'wrong password !'
			});
		} else {
			req.session.user = {
	            uid: _user._id,
	            username: _user.username,
	            display_name: _user.display_name,
	            email: _user.email,
	            avatar: _user.avatar,
	            isActive: _user.isActive,
	            des: _user.des
	        };
			res.send({
				code: 200,
				user: _user
			});
		}
	});
};
var editAvatar = function(req, res) {
	var user = req.session.user;
	var avatar = req.body.avatar;
	User.find({
		_id: user.uid
	}, function(err, user) {
		var _user = user[0];
		_user.avatar = avatar;
		_user.save(function(err) {
			req.session.user = {
	            uid: _user._id,
	            username: _user.username,
	            display_name: _user.display_name,
	            email: _user.email,
	            avatar: _user.avatar,
	            isActive: _user.isActive,
	            des: _user.des
	        };
			res.send({
				code: 200,
				user: _user
			});
		});
	});
};

module.exports = function(app) {
    app.post('/api/user/register', create);
    app.post('/api/user/login', login);
    app.get('/api/user/logout', logout);
    // app.get('/api/user/:userId', show);

    app.post('/api/user/edit/basic', editBasic);
    app.post('/api/user/edit/password', editPassword);
    app.post('/api/user/edit/avatar', editAvatar);
};