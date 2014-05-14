var Models = require('../models');
var Doc = Models.Doc;
var Chapter = Models.Chapter;
var Section = Models.Section;
var Translate = Models.Translate;
var User = Models.User;

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
            doc[0].chapters.map(function(chapter, key) {
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
    var getAdmin = function(req, res) {
        var user = req.params.user;
        if (user !== req.session.user.username) {
            return res.send('not authored');
        }
        res.render('admin.html');
    };
    var getHome = function(req, res) {
        res.render('home');
    };
    var getSearch = function(req, res) {
        res.render('search');
    };
    var getSignup = function(req, res) {
        res.render('signup');
    };
    app.get('/signup', getSignup);
    app.get('/doc', getHome);
    app.get('/doc/search', getSearch);
    app.get('/doc/:doc', getDoc);
    app.get('/doc/:doc/:chapter', getDoc);
    app.get('/user/admin', middleware.check_login, getAdmin);
};