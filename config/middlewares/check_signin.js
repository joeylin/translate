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

/*
 *  User authorization routing middleware
 */

exports.user = {
  hasAuthorization: function (req, res, next) {
    
  }
};

*
 *  Article authorization routing middleware
 */

exports.article = {
  hasAuthorization: function (req, res, next) {
    
  }
};

/**
 * Comment authorization routing middleware
 */

exports.comment = {
  hasAuthorization: function (req, res, next) {
    
  }
};