var Models = require('../models');
var Job = Models.Job;
var Company = Models.Company;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Share = Models.Share;

var middleware = require('./middleware');

var getShareByUser = function(req, res) {
    var user = req.session.user;
    // mock
    var result = [{
        user: {
            username: 'joeylin',
            avatar: ''
        },
        content: 'mynam is linyao ,my name is linyao, my name is linyao.',
        date: '2014/05/24',
        comments: [{
            user: {
                username: 'laolei',
                avatar: 'xxxx',
            },
            content: 'it is very good, thanks very much',
            date: 'a minute ago'
        }, {
            user: {
                username: 'xianzhi',
                avatar: 'xxxx',
            },
            content: 'I am a xianzhi, pls ask me future',
            date: '12 minute ago'
        }, {
            user: {
                username: 'me',
                avatar: 'xxxx',
            },
            content: 'me me me me me me me me me me me',
            date: '10 minute ago'
        }]
    }, {
        user: {
            username: 'mingong',
            avatar: ''
        },
        content: 'mynam is mingong ,my name is mingong, my name is mingong.',
        date: '2014/05/24',
        comments: [{
            user: {
                username: 'one',
                avatar: 'xxxx',
            },
            content: 'it is very good, thanks very much',
            date: 'a minute ago'
        }, {
            user: {
                username: 'two',
                avatar: 'xxxx',
            },
            content: 'I am a xianzhi, pls ask me future',
            date: '12 minute ago'
        }, {
            user: {
                username: 'three',
                avatar: 'xxxx',
            },
            content: 'me me me me me me me me me me me',
            date: '10 minute ago'
        }]
    }];
    console.log('getShare');
    res.send({
        code: 200,
        content: result
    });
};
var getShareById = function(req, res) {
    var id = req.params.id;

};


module.exports = function(app) {
    app.get('/api/share/user', getShareByUser);
    app.get('/api/share/id/:id', getShareById);
};