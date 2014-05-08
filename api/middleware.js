var check_login = function(req, res, next) {
    if (req.session.user) {
        res.locals.user = req.session.user;
        res.locals.is_authorized = true;
    } else {
        res.locals.is_authorized = false;
    }
    next();
};
var check_admin = function(req, res, next) {

};
var check_auth = function(req, res, next) {

};
exports.check_login = check_login;
exports.check_admin = check_admin;
exports.check_auth = check_auth;