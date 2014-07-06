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
    var perPageItems = 30;
    
    var query = {
        role: 'user'
    };
    if (company) {
        query.company = company;
    }
    if (school) {
        query.school = school;
    }
    if (location) {
        query.location = location;
    }
    if (name) {
        var re = new RegExp(name,'ig');
        query.name = re;
    }
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
    app.get('/api/search/people', getPeople);
    app.get('/api/search/jobs', getJobs);
    app.get('/api/search/company', getCompany);
    app.get('/api/search/share', getShare);
};

// helper
function setRelate(users, meId, cb) {
    var results = [];
    if (!meId) {
        return users;
    }
    User.findOne({
        _id: meId
    }, function(err, me) {
        users.map(function(user, key) {
            var obj = {
                avatar: user.avatar,
                _id: user._id,
                name: user.name,
                desc: user.desc
            };
            obj.isMe = false;
            obj.isConnected = false;
            if (user._id.toString() === meId) {
                obj.isMe = true;
                obj.isConnected = true;
            } else {
                me.connects.map(function(connect, key) {
                    if (connect.user.toString() === user._id.toString()) {
                        obj.isConnected = true;
                    }
                });
            }
            results.push(obj);
        });
        cb(results);
    });
}