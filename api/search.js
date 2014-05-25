var Models = require('../models');
var Job = Models.Job;
var Company = Models.Company;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Share = Models.Share;

var middleware = require('./middleware');

// data format
// user = {
//     uid: '',
//     username: '',
//     desc: '',
//     info: '',
//     similar: [],
//     avatar: 'http://tp3.sinaimg.cn/2253352402/180/5643769919/1',
//     isConnected: false
// };

var getPeople = function(req, res) {
    var query = req.query;
    console.log(query);
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