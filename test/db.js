var mongoose = require('mongoose');
var async = require('async');
var marked = require('marked');
var config = require('../config').config;

mongoose.connect(config.db, function(err) {
    if (err) {
        console.error('connect to %s error: ', config.db, err.message);
        process.exit(1);
    }
});

require('./doc');
require('./chapter');
require('./section');
require('./translate');
require('./user');

var Doc = mongoose.model('Doc');
var Chapter = mongoose.model('Chapter');
var Section = mongoose.model('Section');
var Translate = mongoose.model('Translate');
var User = mongoose.model('User');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Doc.find({name:'mongoose'}).exec(function(err,doc) {
// 	errorHandle(err, 'doc');
// 	//console.log(doc.chapters);
// 	doc[0].save(function(err,doc) {
// 		console.log(doc);
// 	});
// });
// Doc.find({name:'mongoose'}).populate('chapters').exec(function(err,doc) {
// 	errorHandle(err, 'populate');
// 	//console.log(doc[0].chapters);
// });

// get doc toc
Doc.find({name: 'node.js'}).populate('chapters').exec(function(err,doc) {
	doc[0].chapters.map(function(value) {
		// console.log(value.name);
		// console.log(value._id);
	});
});

//get spec chapter content
Chapter.find({_id: '53480894cb2bd41f0c000004'}).populate('sections').exec(function(err,chapter) {
	var html = '';
	chapter[0].sections.map(function(section) {
		// console.log(section.index);
		// console.log(section._id);
		// console.log(section.html);
		html += section.html;
	});
	// console.log(html);
});

// get Chapter by docName and chapterName
var docName = 'node.js';
var name = 'addons';
Chapter.find({name: name,doc: docName}).populate('sections').exec(function(err,chapter) {
	var html = '';
	chapter[0].sections.map(function(section) {
		// console.log(section.index);
		// console.log(section._id);
		// console.log(section.html);
		html += section.html;
	});
	console.log(html);
});

// get spec section 
Section.find({_id: '53480894cb2bd41f0c000005'}).exec(function(err,section) {
	// test virtul property
	// console.log(section[0].html);
	// console.log(marked(section[0].content));
	var content = section[0].populate('translates');
	// console.log(content.exec()); // this is error
});

// get section best translate
Section.find({_id: '53480894cb2bd41f0c000005'}).populate('translates').exec(function(err,section) {
	var best;
    section[0].translates.sort(function(a,b) {
        return a.getStarNumber <= b.getStarNumber ? 1 : -1;
    });
    best = section[0].translates[0];
    // console.log(best);
});

// push translate
var translateData = {
	content: 'zhongwenfanyi,zai fanyi yici',
	origin: '53480894cb2bd41f0c000005',
	author: 'joeylin'
};
Section.find({_id: '53480894cb2bd41f0c000005'}).exec(function(err,section) {
	// Translate.createNew(translateData, function(err,translate) {
	// 	section[0].translates.push(translate._id);
	// 	section[0].save(function(err,sec) {
	// 		if (err) {
	// 			console.log('err section');
	// 			return;
	// 		}
	// 		console.log(sec);
	// 	});
	// });
});

// get translate / star translate
Translate.find({_id: '53426fa34a8f1b590e000001'}).exec(function(err,translate) {
	// get translate content
	// console.log(translate[0].content);

	// translate[0].star('joeylin');
	// translate[0].star('laolei');
	// console.log(translate[0].getStarNumber);
	// console.log(translate[0].userIsStared('laolei'));
	// translate[0].unstar('laolei');
	// console.log(translate[0].getStarNumber);
	// console.log(translate[0].userIsStared('laolei'));
});


// create User
var userData = {
	name: 'joeylin',
	email: '331547274@qq.com',
	password: '123456'
};
var userData1 = {
	name: 'laolei',
	email: '331547274@gmail.com',
	password: '123456'
};

// User.createNew(userData,function(err,user) {
// 	console.log(user);
// });
// User.createNew(userData1,function(err,user) {
// 	console.log(user);
// });

// user translate progress
var userName = 'joeylin';
Doc.find({name:'node.js'}).populate('chapters').exec(function(err,doc) {
	var total = 0;
	var translated = 0;
	var progress;

	// async.eachSeries(doc[0].chapters, function(chapter,next) {
	// 	total += chapter.total;
	// 	Section.find({chapter: chapter._id}).populate('translates').exec(function(err,sections) {
	// 		sections.map(function(section) {
	// 			section.translates.map(function(translate) {
	// 				if (translate.author === userName) {
	// 					translated++;
	// 				}
	// 			});
	// 		});
	// 		next();
	// 	});
	// }, function(err) {
	// 	progress = Math.round(translated / total * 10000) / 100 + '%';
	// 	// console.log(translated,total,progress);
	// });
});





