var user = require('../controllers/user');

module.exports = function(app) {
	// user signup
	app.post('/api/users', user.create);
	// user login
	app.post('/api/users/session',passport.authenticate('local', {
		failureRedirect: '/login',
		failureFlash: 'Invalid email or password.'
	}), user.session);
	// show user info
	app.get('/api/users/:userId', user.show);
	
	// auth
	app.get('/api/auth/facebook',passport.authenticate('facebook', {
		scope: [ 'email', 'user_about_me'],
		failureRedirect: '/login'
	}), user.signin);
	app.get('/api/auth/facebook/callback',passport.authenticate('facebook', {
	  failureRedirect: '/login'
	}), user.authCallback);
	app.get('/api/auth/github',passport.authenticate('github', {
	  failureRedirect: '/login'
	}), user.signin);
	app.get('/api/auth/github/callback',passport.authenticate('github', {
	  failureRedirect: '/login'
	}), user.authCallback);
	app.get('/api/auth/twitter',passport.authenticate('twitter', {
	  failureRedirect: '/login'
	}), user.signin);
	app.get('/api/auth/twitter/callback',passport.authenticate('twitter', {
	  failureRedirect: '/login'
	}), user.authCallback);
	app.get('/api/auth/google',passport.authenticate('google', {
	  failureRedirect: '/login',
	  scope: [
	    'https://www.googleapis.com/auth/userinfo.profile',
	    'https://www.googleapis.com/auth/userinfo.email'
	  ]
	}), user.signin);
	app.get('/api/auth/google/callback',passport.authenticate('google', {
	  failureRedirect: '/login'
	}), user.authCallback);
	app.get('/api/auth/linkedin',passport.authenticate('linkedin', {
	  failureRedirect: '/login',
	  scope: [
	    'r_emailaddress'
	  ]
	}), user.signin);
	app.get('/api/auth/linkedin/callback',passport.authenticate('linkedin', {
	  failureRedirect: '/login'
	}), user.authCallback);

	app.param('userId', user.user);
};