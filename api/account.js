var Models = require('../models');
var Job = Models.Job;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Trend = Models.Trend;
var Share = Models.Share;
var Request = Models.Request;
var Group = Models.Group;

var editPassword = function(req, res) {
    var user = req.session.user;
    var origin = req.body.originPassword;
    var password = req.body.newPassword;
    User.find({
        _id: user._id
    }, function(err, user) {
        var _user = user[0];
        if (!_user.authenticate(password)) {
            res.send({
                code: 404,
                info: 'wrong password !'
            });
        } else {
            req.session.user = _user;
            res.send({
                code: 200,
                user: _user
            });
        }
    });
};
var getUploadToken = function(req, res) {
    var qiniu = require('qiniu');
    var config = require('../config/config.js');
    qiniu.conf.ACCESS_KEY = config.qiniu.accessKey;
    qiniu.conf.SECRET_KEY = config.qiniu.secretKey;
    var putPolicy = new qiniu.rs.PutPolicy(config.qiniu.bucket);
    var result = {
        token: putPolicy.token(),
        host: config.qiniu.bucketHost
    };
    res.json(result);
};

module.exports = function(app) {
    app.post('/api/user/account/password', editPassword);
    app.post('/api/token.json', getUploadToken);
};