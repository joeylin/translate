var Models = require('../models');
var Job = Models.Job;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Share = Models.Share;
var Request = Models.Request;
var Group = Models.Group;

var middleware = require('./middleware');

var getPeople = function(req, res) {
    var user = req.session.user;
    var name = req.query.name;
    var location = req.query.location;
    var school = req.query.school;
    var company = req.query.company;
    var name = req.query.name;
    var page = req.query.page || 1;
    var perPageItems = 20;
    
    var query = {
        role: 'user',
        is_delete: false
    };
    query.$or = [];
    if (name) {
        query.$or.push({
            name: new RegExp(name, 'i')
        });
    }
    if (school) {
        query.$or.push({
            school: new RegExp(school, 'i')
        });
    }
    if (location) {
        query.$or.push({
            location: new RegExp(location, 'i')
        });
    }
    if (company) {
        query.$or.push({
            company: new RegExp(company, 'i')
        });
    }

    if (query.$or.length === 0) {
        return res.send({
            code: 200,
            content: [],
            count: 0,
            hasNext: false
        });
    }

    User.findOne({
        _id: user._id
    }).exec(function(err, user) {
        var array = [];
        user.connects.map(function(item) {
            array.push(item.user.toString());
        });
        array.push(user._id.toString());
        query._id = {
            $nin: array
        };
        User.find(query).skip((page - 1) * perPageItems).limit(perPageItems).exec(function(err, users) {
            User.find(query).count().exec(function(err, count) {
                var results = [];
                var hasNext;
                users.map(function(item) {
                    var obj = {
                        id: item.id,
                        _id: item._id,
                        name: item.name,
                        avatar: item.avatar,
                        school: item.school,
                        location: item.location,
                        company: item.company,
                        connects: item.connects.length,
                        occupation: item.occupation
                    };
                    results.push(obj);
                });
                if ((page - 1) * perPageItems + results.length < count) {
                    hasNext = true;
                } else {
                    hasNext = false;
                }
                res.send({
                    code: 200,
                    content: results,
                    count: count,
                    hasNext: hasNext
                });
            });
        });
    }); 
};

var getJobs = function(req, res) {
    var query = req.query;
    console.log(query);
};
var getCompany = function(req, res) {
    var query = req.query;
    console.log(query);
};
var getShare = function(req, res) {
    var query = req.query;
    console.log(query);
};
module.exports = function(app) {
    app.get('/api/search/people', middleware.check_login, getPeople);
    app.get('/api/search/jobs', getJobs);
    app.get('/api/search/company', getCompany);
    app.get('/api/search/share', getShare);
};
