var Models = require('../models');
var Doc = Models.Doc;
var Chapter = Models.Chapter;
var Section = Models.Section;
var Translate = Models.Translate;
var User = Models.User;

var create = function(req,res) {
	var options = {
		userName: req.body.username,
		email: req.body.email,
		passport: req.body.passport
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
	if ((req.user && req.user.error) || !req.user) {
		res.send({
			isLogin: false,
			info: 'cant authored this user;'
		});
	} else {
		res.send({
			isLogin: true,
			user: user
		});
	}
};
var logout = function(req,res) {
	req.logout();
	res.send({
		isLogin: false,
		info: 'logout'
	});
};

var findUser = function (req, res, next, id) {
  User.findOne({ _id : id }).exec(function (err, user) {
      if (err) return next(err)
      if (!user) return next(new Error('Failed to load User ' + id))
      req.profile = user;
      next();
    });
}

exports.authCallback = authCallback;
exports.create = create;
exports.user = findUser;
