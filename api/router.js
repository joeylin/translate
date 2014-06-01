var Models = require('../models');
var Doc = Models.Doc;
var Chapter = Models.Chapter;
var Section = Models.Section;
var Translate = Models.Translate;
var Job = Models.Job;
var CompanyProfile = Models.CompanyProfile;
var User = Models.User;
var UserProfile = Models.UserProfile;
var Comment = Models.Comment;
var Trend = Models.Trend;
var Request = Models.Request;
var Share = Models.Share;

var fs = require('fs');
var path = require('path');
var async = require('async');
var marked = require('marked');
var config = require('../config/config').config;
var middleware = require('./middleware');


module.exports = function(app) {
    var getDoc = function(req, res) {
        var name = req.params.doc;
        var chapter = req.params.chapter;
        var DOC_PATH = path.resolve(__dirname, '../docs/' + name);
        var result = {};

        // fs.readFile(DOC_PATH + '/_toc.markdown', 'utf8', function(err, file) {
        //     if (err) {
        //         console.log('err');
        //     }
        //     app.locals.user = req.session.user;
        //     app.locals.docName = name;
        //     app.locals.chapter = chapter;
        //     app.locals.toc = marked(file).replace(/(href)/g, 'ng-href');
        //     res.render('index');
        // });
        Doc.find({
            name: name
        }).populate('chapters').exec(function(err, doc) {
            var toc = [];
            var _doc = doc[0];
            _doc.chapters.map(function(chapter, key) {
                var obj = {};
                obj.name = chapter.name;
                obj.id = chapter._id;
                toc.push(obj);
            });
            app.locals.user = req.session.user;
            app.locals.chapter = chapter;
            app.locals.doc = {};
            app.locals.doc.docName = name;
            app.locals.doc.toc = toc;
            app.locals.doc.chapter = chapter;
            res.render('index');
        });
    };
    var getSetting = function(req, res) {
        app.locals.user = req.session.user;
        res.render('settings.html');
    };
    var getDocHome = function(req, res) {
        app.locals.user = req.session.user;
        res.render('doc-home');
    };
    var getDocSearch = function(req, res) {
        app.locals.user = req.session.user;
        res.render('doc-search');
    };

    // here begin
    var getSignup = function(req, res) {
        res.render('signup');
    };
    var getLogin = function(req, res) {
        res.render('login');
    };

    // public
    var getProfile = function(req, res) {
        var id = req.params.id;
        if (!id) {
            return res.render('user-profile');
        }
        User.getProfile(id, function(err, profile) {
            if (err) {
                // here send 404 page
                console.log(err);
            }
            app.locals.profile = profile;
            if (req.session && req.session.user) {
                app.locals.user = req.session.user;
            }
            if (profile.name === 'user') {
                res.render('user-profile');
            }
            if (profile.name === 'company') {
                res.render('user-profile');
            }
        });
    };
    var getShare = function(req, res) {
        if (req.session && req.session.user) {
            app.locals.user = req.session.user;
        }
        res.render('share');
    };

    // need login
    var getHome = function(req, res) {
        var user = req.session.user;
        app.locals.user = user;
        if (user.role === 'user') {
            res.render('user-home');            
        } else {
            res.render('company-home');
        }
    };
    var getNotify = function(req, res) {
        app.locals.user = req.session.user;
        res.render('notify');
    };
    var getSearch = function(req, res) {
        app.locals.user = req.session.user;
        res.render('search');
    };
    var getProfileSettings = function(req, res) {
        var user = req.session.user;
        app.locals.user = user;
        if (user.role === 'user') {
            res.render('settings-user-profile');
        } else {
            // res.render('settings-company-profile');
            res.render('settings-user-profile');
        }
        
    };
    app.get('/signup', getSignup);
    app.get('/login', getLogin);
    app.get('/doc', getDocHome);
    app.get('/doc/search', getDocSearch);
    app.get('/doc/:doc', getDoc);
    app.get('/doc/:doc/:chapter', getDoc);

    // settings
    // app.get('/settings', middleware.check_auth, getSetting);
    // app.get('/settings/:op', middleware.check_auth, getSetting);
    // company
    // app.get('/company', getCompany);
    // app.get('/company/:user', getCompany);
    
    // home
    app.get('/home', middleware.check_login, getHome);

    // profile
    app.get('/profile', getProfile);
    app.get('/profile/:id', getProfile);

    // settings
    app.get('/settings/profile', middleware.check_login, getProfileSettings);
    app.get('/settings/account', middleware.check_login, getProfileSettings);

    // notification
    app.get('/notify', middleware.check_login, getNotify);
    app.get('/notify/:op', middleware.check_login, getNotify);

    // share
    app.get('/share', getShare);
    app.get('/share/:id', getShare);

    // search 
    app.get('/search', middleware.check_login, getSearch);
    app.get('/search/:op', middleware.check_login, getSearch);
};