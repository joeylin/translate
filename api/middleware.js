var check_login = function(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        var redirectTo = req.path;
        if (redirectTo && redirectTo !== '/') {
            res.redirect('/login?re=' + redirectTo);
        } else {
            res.redirect('/login');
        }
    }
};
var check_admin = function(req, res, next) {
    next();
};
// for settings
var check_auth = function(req, res, next) {
    var page = req.params.op;
    if (!req.session.user && page !== 'login') {
        res.redirect('/settings/login');
    } else {
        next();
    }
};
exports.check_login = check_login;
exports.check_admin = check_admin;
exports.check_auth = check_auth;