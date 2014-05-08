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
        result.code = 200;
        result.toc = file;
        result.name = name;
        result.version = '0.1.0';

        res.send(result);
    });
};
var getChapter = function(req, res) {
    var result = {};
    var name = req.params.name;
    var doc = req.params.doc;

    Chapter.find({
        name: name,
        doc: doc
    }).populate('sections').exec(function(err, chapter) {
        result.sections = [];
        result.name = chapter[0].name;
        result.index = chapter[0].index;

        async.eachSeries(chapter[0].sections, function(section, next) {
            getOneTranslate(section._id, function(err, translate) {
                var sec = {
                    id: section._id,
                    md: section.content,
                    translate: translate,
                    isFinished: section.isFinished,
                    saveTitle: 'save'
                };
                result.sections.push(sec);
                next();
            });
        }, function(err) {
            result.code = 200;
            res.send(result);
        });
    });
};
var getOneTranslate = function(id, cb) {
    Section.find({
        _id: id
    }).populate('translates').exec(function(err, section) {
        var sec = section[0];
        var result = sec.translates[sec.translates.length - 1];
        cb(err, result);
    });
};
var saveTranslate = function(req, res) {
    var id = req.body.id;
    var user = req.body.user;
    var content = req.body.content;

    var translateData = {
        content: content,
        origin: id,
        user: user
    };
    Section.find({
        _id: id
    }, function(err, section) {
        var sec = section[0];
        if (sec.isFinished && sec.isFinished.value) {
            return res.send({
                code: 404,
                info: 'has finished'
            });
        } else {
            Translate.createNew(translateData, function(err, translate) {
                sec.translates.push(translate._id);
                sec.save(function(err, result) {
                    res.send({
                        code: 200
                    });
                });
            });
        }
    });
};
var setFinish = function(req, res) {
    var id = req.body.id;
    var userId = req.body.userId;
    Section.find({
        _id: id
    }, function(err, section) {
        if (err) {
            return false;
        }
        var sec = section[0];
        sec.setFinished(userId);
        res.send({
            code: 200
        });
    });
};

module.exports = function(app) {
    app.get('/api/doc/:name', getDoc);
    app.get('/api/chapter/:doc/:name', getChapter);
    app.post('/api/translate/save', saveTranslate);
    app.post('/api/section/finish', setFinish);
};