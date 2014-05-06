var user = require('../controllers/user');

module.exports = function(app) {
    // user signup
    app.post('/api/user/register', user.create);

    // user login
    app.post('/api/user/login', user.login);

    // user logout
    app.get('/api/user/logout', user.logout);

    // show user info
    app.get('/api/user/:userId', user.show);
};