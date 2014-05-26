var Models = require('../models');
var Job = Models.Job;
var Company = Models.Company;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Share = Models.Share;

var create = function(req, res) {
    var options = {
        name: req.body.rname,
        email: req.body.email,
        password: req.body.password
    };
    var company = new Company(options);
    company.provider = 'local';
    company.save(function(err, company) {
        if (err) {
            var message = err.message;
            return res.send({
                code: 404,
                company: null,
                info: message
            });
        }
        req.session.company = {
            id: company._id,
            name: company.name,
            display_name: company.display_name,
            email: company.email,
            avatar: company.avatar,
            isActive: company.isActive,
            des: company.desc
        };
        res.send({
            code: 200,
            company: req.session.company
        });
    });
};
var login = function(req, res) {
    var name = req.body.name;
    var password = req.body.password;
    User.findOne({
        name: name
    }, function(err, company) {
        if (err) {
            console.log('xxxnone users');
            return false;
        }
        if (!company) {
            return res.send({
                code: 404,
                company: null,
                info: 'unkown company'
            });
        }
        if (!company.authenticate(password)) {
            return res.send({
                code: 404,
                company: null,
                info: 'error company or password'
            });
        }
        req.session.company = {
            id: company._id,
            name: company.name,
            display_name: company.display_name,
            email: company.email,
            avatar: company.avatar,
            isActive: company.isActive,
            des: company.desc
        };
        res.send({
            code: 200,
            company: req.session.company
        });
    });
};
var logout = function(req, res) {
    req.session.destroy();
    res.send({
        code: 200,
        company: null
    });
};
var findCompany = function(req, res) {
    var id = req.body.id;
    Company.findOne({
        _id: id
    }).exec(function(err, company) {
        if (err) {
            console.log('err find');
        }
        if (!company) {
            return res.send({
                code: 404,
                info: 'unkown company'
            });
        } else {
            res.send({
                code: 200,
                company: company
            });
        }
    });
};
var editBasic = function(req, res) {
    var company = req.session.company;
    var display_name = req.body.display_name;
    var email = req.body.email;
    var desc = req.body.resc;
    Company.find({
        _id: company.id
    }, function(err, company) {
        var _company = company[0];
        _company.display_name = display_name;
        _company.email = email;
        _company.des = des;
        _company.save(function(err) {
            req.session.company = {
                id: _company._id,
                name: _company.name,
                display_name: _company.display_name,
                email: _company.email,
                avatar: _company.avatar,
                isActive: _company.isActive,
                desc: _company.desc
            };
            res.send({
                code: 200,
                company: _company
            });
        });
    });
};
var editPassword = function(req, res) {
    var company = req.session.company;
    var origin = req.body.originPassword;
    var password = req.body.newPassword;
    Company.find({
        _id: company.id
    }, function(err, company) {
        var _company = company[0];
        if (!_company.authenticate(password)) {
            res.send({
                code: 404,
                info: 'wrong password !'
            });
        } else {
            req.session.company = {
                id: _company._id,
                name: _company.name,
                display_name: _company.display_name,
                email: _company.email,
                avatar: _company.avatar,
                isActive: _company.isActive,
                desc: _company.desc
            };
            res.send({
                code: 200,
                company: _company
            });
        }
    });
};
var editAvatar = function(req, res) {
    var company = req.session.company;
    var avatar = req.body.avatar;
    Company.find({
        _id: company.id
    }, function(err, company) {
        var _company = company[0];
        _company.avatar = avatar;
        _company.save(function(err) {
            req.session.company = {
                id: _company._id,
                name: _company.name,
                display_name: _company.display_name,
                email: _company.email,
                avatar: _company.avatar,
                isActive: _company.isActive,
                desc: _company.desc
            };
            res.send({
                code: 200,
                company: _company
            });
        });
    });
};

module.exports = function(app) {
    app.post('/api/company/register', create);
    app.post('/api/company/login', login);
    app.get('/api/company/logout', logout);
    // app.get('/api/company/:userId', show);

    app.post('/api/company/edit/basic', editBasic);
    app.post('/api/company/edit/password', editPassword);
    app.post('/api/company/edit/avatar', editAvatar);
};