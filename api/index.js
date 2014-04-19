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
var config = require('../config').config;

var getDoc = function(req,res) {
	var name = req.params.name;
	var DOC_PATH = path.resolve(__dirname, '../docs/' + name);
	var result = {};
	fs.readFile(DOC_PATH + '/_toc.markdown', 'utf8', function(err, file) {
		if (err) {
			console.log('err');
		}
		result.toc = file;
		result.name = name;
		result.version = '0.1.0';

		res.send(result);
	});
};
var getChapter = function(req,res) {
	var result = {};
	var name = req.params.name;
	var doc = req.params.doc;

	if ((doc && !name)||(doc && name === "#") ) {
		// this is example
		res.send({
			particpate: [{
				user: 'joeylin',
				percent: '10%'
			},{
				user: 'laolei',
				percent: '20%'
			},{
				user: 'xianzhi',
				percent: '45%'
			}]
		});
		return;
	}

	Chapter.find({name: name,doc:doc}).populate('sections').exec(function(err,chapter) {
		result.sections = [];
		result.name = chapter[0].name;
		result.index = chapter[0].index;

		async.eachSeries(chapter[0].sections, function(section,next) {
			getTranslate(section._id,function(err,translates) {
				var sec = {
					id: section._id,
					md: section.content,
					translates: translates
				};
				result.sections.push(sec);
				next();
			});
		},function(err) {
			res.send(result);
		});	
	});
};
var getTranslate = function(id,cb) {
	Section.find({_id: id}).populate('translates').exec(function(err,section) {
		var best = [];
	    section[0].translates.sort(function(a,b) {
	        return a.getStarNumber <= b.getStarNumber ? 1 : -1;
	    });
	    if (section[0].translates[0]) {
	    	best[0] = {
	    		author: section[0].translates[0].author,
	    		date: section[0].translates[0].createAt,
	    		id: section[0].translates[0]._id,
	    		content: section[0].translates[0].content
	    	};
	    }
	    if (section[0].translates[1]) {
	    	best[1] = {
	    		author: section[0].translates[0].author,
	    		date: section[0].translates[0].createAt,
	    		id: section[0].translates[1]._id,
	    		content: section[0].translates[1].content
	    	};
	    }
	    cb(err,best);
	});
};
var saveTranslate = function(req,res) {
	var id = req.params.id;
	var user = req.body.translate.user;
	var content = req.body.translate.content;

	var translateData = {
		content: content,
		origin: id,
		author: user
	};
	Translate.createNew(translateData, function(err,translate) {
		Section.find({_id: id}).exec(function(err,sections) {
			sections[0].translates.push(translate._id);
			sections[0].save(function(err,result) {
				res.send(200);
			});
		});
	});
};

module.exports = function(app) {
	app.get('/api/doc/:name', getDoc);
	app.get('/api/chapter/:doc/:name', getChapter);
	app.post('/api/section/:id/translate', saveTranslate);
};

