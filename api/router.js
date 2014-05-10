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

        fs.readFile(DOC_PATH + '/_toc.markdown', 'utf8', function(err, file) {
            if (err) {
                console.log('err');
            }
            app.locals.user = req.session.user;
            app.locals.docName = name;
            app.locals.chapter = chapter;
            app.locals.toc = marked(file).replace(/(href)/g, 'ng-href');
            res.render('index');
        });
    };
    var getAdmin = function(req, res) {
        var user = req.params.user;
        if (user !== req.session.user.username) {
            return res.send('not authored');
        }
        res.render('admin');
    };
    app.get('/doc/:doc', getDoc);
    app.get('/doc/:doc/:chapter', getDoc);
    app.get('/:user/admin', middleware.check_login, getAdmin);
};