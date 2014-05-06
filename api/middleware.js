var check_login = function(req, res, next) {
    if (req.session.user) {
        res.locals.user = req.session.user;
        res.locals.is_authorized = true;
    } else {
        res.locals.is_authorized = false;
    }
    next();
};
exports.check_login = check_login;