var Models = require('../models');
var Job = Models.Job;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Trend = Models.Trend;
var Request = Models.Request;
var Share = Models.Share;
var Group = Models.Group;
var IdGenerator = Models.IdGenerator;
var Invitation = Models.Invitation;
var Feedback = Models.Feedback;

var async = require('async');
var moment = require('moment');
var email = require('../lib/email');

// create invitation
console.log(' create invitation ');
Invitation.createNew({
	user: '53d6ba954d8925881ce5f595',
    type: 'system'
}, function(err, invite) {
	if (err || !invite) {
		console.log(err.msg, err);
		return false;
	}
	email({
		name: 'admin',
		email: 'joe.y.lin.2012@gmail.com',
		content: invite.code
	}, true);
	console.log('create success !');

	setTimeout(function() {
		var options = {
	        name: 'morepush',
	        email: 'morepush@qq.com',
	        password: 'linyao',
	        sex: '男',
	        role: 'admin'
	    };
		var user = new User(options);
        var profile;
        profile = new UserProfile({
            user: user._id,
            name: 'user'
        });
        user.provider = 'local';
        user.isActive = true;
        user.registerStage = 3;
        profile.save(function(err, _profile) {
            IdGenerator.getNewId('user', function(err, doc) {
                user.id = doc.currentId;
                user.profile = _profile._id;
                user.save(function(err, user) {
                    if (err) {
                        var message = err.message;
                        console.log(err.message,err);
                        return false;
                    }
                    console.log('admin create success !');
                    email({
                    	name: 'admin',
						email: 'joe.y.lin.2012@gmail.com',
						content: user.email + ' ' + user.password
                    }, true);
                });
            });
        });
	}, 2000);
});