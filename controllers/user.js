var Models = require('../models');
var Doc = Models.Doc;
var Chapter = Models.Chapter;
var Section = Models.Section;
var Translate = Models.Translate;
var User = Models.User;

var create = function(req,res) {
	var options = {
		username: req.body.username,
		email: req.body.email,
		password: req.body.password
	};
	var user = new User(options);
	user.provider = 'local';
	user.save(function(err,user) {
		if (err) {
			console.log('err');
		}
		req.login(user, function(err) {
			if (err) { return next(err); }
			return res.send({
				isLogin: true,
				user: user
			});
		});
	});
};
var login = function(req,res) {
	var email = req.body.logname;
	var password = req.body.logpwd;
	User.findOne({ email: email }, function (err, user) {
        if (err) { return done(err) }
        if (!user) {
          	return res.send({
          		error: {
          			name: 'unkown user'
          		},
	          	isLogin: false
          	});
        }
        if (!user.authenticate(password)) {
          	return res.send({
          		error: {
          			name: 'Invalid password'
          		},
	          	isLogin: false
          	});
        }
        req.session.userId = user.username;
        req.session.user = user;
        res.send({
			isLogin: true,
			user: {
				name: user.username,
				id: user._id
			}
		});
    });
};
var logout = function(req,res) {
	req.session.destroy();
	res.send({
		isLogin: false,
		info: 'logout'
	});
};
var findUser = function (req, res) {
	var id = req.body.id;
  	User.findOne({ _id : id }).exec(function (err, user) {
      	if (err) { console.log('err find')}
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

