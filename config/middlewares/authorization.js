var utils = require('./utils');
var config = require('../config');


exports.requiresLogin = function(req, res, next) {
    if (!req.session.userId) {
        res.send({
            isLogin: false,
            info: 'no auth'
        });
    } else {
        next();
    }
};