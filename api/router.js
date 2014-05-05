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

var getDoc = function(req, res) {
    var name = req.params.name;
    var DOC_PATH = path.resolve(__dirname, '../docs/' + name);
    var result = {};
    fs.readFile(DOC_PATH + '/_toc.markdown', 'utf8', function(err, file) {
        if (err) {
            console.log('err');
        }

        app.locals.docName = name;
        app.locals.toc = marked(file);

        res.render('index');
    });
};

module.exports = function(app) {
    app.get('/doc/:doc', getDoc);
    app.get('/doc/:doc/:chapter', getDoc);
};