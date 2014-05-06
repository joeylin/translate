var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var async = require('async');
var config = require('../config/config.js').config;

mongoose.connect(config.db, function(err) {
    if (err) {
        console.error('connect to %s error: ', config.db, err.message);
        process.exit(1);
    }
});

function errorHandle(err, desc) {
    if (err) {
        console.log('err xxxxx', desc);
    }
}

require('../models/doc');
require('../models/chapter');
require('../models/section');
require('../models/translate');
require('../models/user');

var Doc = mongoose.model('Doc');
var Chapter = mongoose.model('Chapter');
var Section = mongoose.model('Section');
var Translate = mongoose.model('Translate');
var User = mongoose.model('User');

// var data1 = [
// 	{
// 		name: 'bootstrap.js',
// 		des: 'a bootstrap.js community'
// 	},
// 	{
// 		name: 'angular.js',
// 		des: 'a angular.js community'
// 	},
// 	{
// 		name: 'less.js',
// 		des: 'a less.js community'
// 	},
// 	{
// 		name: 'css.js',
// 		des: 'a css.js community'
// 	},
// 	{
// 		name: 'html5.js',
// 		des: 'a html5.js community'
// 	}
// ];

// data1.map(function(value,key){
// 	Doc.createNew(value, function(err,doc) {
// 		if (err) {console.log('err')}
// 		console.log(doc);
// 	});
// });

// var data = {
// 	name: 'mongoose',
// 	des: 'a nosql db'
// };

// var chapterData = [
// 	{
// 		name: 'Chapter1',
// 		index: 0
// 	},
// 	{
// 		name: 'Chapter2',
// 		index: 1
// 	},
// 	{
// 		name: 'Chapter3',
// 		index: 2
// 	},
// 	{
// 		name: 'Chapter4',
// 		index: 3
// 	},
// 	{
// 		name: 'Chapter5',
// 		index: 4
// 	},
// ];
// var sectionData = [
// 	{
// 		content: '#My Name',
// 		index: 0
// 	},
// 	{
// 		content: '##h2 title',
// 		index: 2
// 	},
// 	{
// 		content: '##h2 title one',
// 		index: 3
// 	},
// 	{
// 		content: '##h2 title two',
// 		index: 4
// 	},
// 	{
// 		content: '##h2 title three',
// 		index: 5
// 	}
// ];
// Doc.createNew(data,function(err,doc) {
// 	errorHandle(err, 'doc');
// 	console.log(doc);

// 	async.eachSeries(chapterData, function(value,next) {
// 		value.doc = doc._id;
// 		Chapter.createNew(value, function(err,chapter) {
// 			errorHandle(err, 'chapter');

// 			doc.chapters.push(chapter._id);
// 			console.log(chapter);
// 			next();
// 		});
// 	}, function(err) {
// 		if (err) {
// 			console.log('err');
// 		} else {
// 			doc.save(function(err,doc) {
// 				errorHandle(err, 'doc save'); 
// 				console.log(doc);
// 			});
// 		}
// 	});
// });





// include real files

var path = require('path');
var fs = require('fs');
var standardLineBreak = require('../tools/utils').standardLineBreak;

var docName = 'node.js';
var DOC_PATH = path.resolve(__dirname, '../docs/' + docName);
var files = fs.readdirSync(DOC_PATH);

// Doc.createNew({
//     name: docName
// }, function(err, doc) {
//     if (err) {
//         debugger;
//         console.log('err xxxx');
//         return;
//     }
//     async.eachSeries(files, function(file, done) {
//         console.log('import %s', file);
//         var f = path.resolve(DOC_PATH, file);
//         fs.readFile(f, 'utf8', function(err, c) {
//             if (err) {
//                 console.log('err');
//                 return;
//             }

//             var plist = c.split(/\r?\n\r?\n/);
//             console.log('  [%d块]', plist.length);

//             // 重新整理内容，判断数据类型
//             var list = [];
//             plist.forEach(function(p) {

//                 // 统一换行符
//                 p = standardLineBreak(p);

//                 var lines = p.split(/\n/);

//                 // 假如第一行是空行，则去掉
//                 if (lines[0].trim() === '') {
//                     lines.shift();
//                     p = lines.join('\n');
//                 }

//                 if (lines.length < 1) return;

//                 // 识别段落类型
//                 var type = '';
//                 if (lines.length === 1) {
//                     if (/^#+\s+.+/.test(lines[0])) {
//                         type = 'title';
//                     } else if (/<!--([^=]+)=([^\-]+)-->/.test(lines[0])) {
//                         type = 'meta';
//                     } else if (/^Stability: ([0-5])(?:\s*-\s*)?(.*)$/.test(lines[0].trim())) {
//                         type = 'stability';
//                     } else if (lines[0].substr(0, 4) === '    ') {
//                         type = 'code';
//                     } else {
//                         type = 'paragraph';
//                     }
//                 } else {
//                     // 每一行都是以四个空格开始，是代码块
//                     type = 'code';
//                     for (var i = 0; i < lines.length; i++) {
//                         if (lines[i].substr(0, 4) !== '    ') {
//                             type = 'paragraph';
//                             break;
//                         }
//                     }
//                     // 首行是``` 以及尾行是 ``` 的也是代码块
//                     if (type !== 'code') {
//                         if (lines[0].substr(0, 3) === '```' || lines[lines.length - 1].substr(-3) === '```') {
//                             type = 'code';
//                         }
//                     }
//                     // 第二行有3个等于号是标题
//                     if (type === 'paragraph') {
//                         if (lines.length === 2 && /^===+$/.test(lines[1])) {
//                             type = 'title';
//                         }
//                     }
//                 }

//                 list.push({
//                     content: p,
//                     type: type
//                 });
//             });
//             plist = list;

//             // 合并相邻的代码块
//             // 找出相邻的代码块
//             for (var i = 0; i < plist.length; i++) {
//                 if (plist[i].type === 'code') {
//                     var c = 1;
//                     while (true) {
//                         if (plist[i + c] && plist[i + c].type === 'code') {
//                             c++;
//                         } else {
//                             break;
//                         }
//                     }
//                     if (c > 1) {
//                         var newContent = standardLineBreak(plist.slice(i, i + c).map(function(item) {
//                             return item.content;
//                         }).join('\n\n'));
//                         plist[i].content = newContent;
//                         plist.splice(i, c - 1);
//                     }
//                 }
//             }
//             var objData = {
//                 name: file.slice(0, -9),
//                 index: files.indexOf(file),
//                 doc: doc.name
//             };

//             Chapter.createNew(objData, function(err, chapter) {
//                 doc.chapters.push(chapter._id);
//                 async.eachSeries(plist, function(item, next) {
//                     console.log('保存内容: [%s] %s', item.type, item.content.substr(0, 20));
//                     var sectionData = {
//                         content: item.content,
//                         dataType: item.type,
//                         chapter: chapter._id,
//                     };
//                     Section.createNew(sectionData, function(err, section) {
//                         if (err) {
//                             console.log('err section');
//                             return;
//                         }
//                         console.log('      [完成]');
//                         chapter.sections.push(section._id);
//                         next();
//                     });
//                 }, function(err) {
//                     if (err) {
//                         console.error(err.stack || err);
//                         process.exit(-1);
//                     }
//                     console.log('  [完成]');
//                     chapter.save(function(err, obj) {
//                         if (err) {
//                             console.log('err push section');
//                             return;
//                         }
//                         console.log(obj);
//                         done();
//                     });
//                 });
//             });
//         });
//     }, function(err) {
//         if (err) {
//             console.log('err import ...')
//         } else {
//             console.log('finish ....')
//         }
//         doc.save(function(err, obj) {
//             if (err) {
//                 console.log('err doc save');
//                 return;
//             } else {
//                 console.log(obj);
//             }
//             process.exit(-1);
//         });
//     });
// });

// import translate
var odd = 1;
Doc.find({
    name: docName
}).populate('chapters').exec(function(err, doc) {
    console.log(doc[0].chapters)
    async.eachSeries(doc[0].chapters, function(chapter, done) {
        var sections = chapter.sections;
        async.eachSeries(sections, function(section, next) {
            var translateData = {
                content: 'this is example',
                origin: section._id,
                author: 'joeylin'
            };
            odd = odd + 1;
            if (odd % 4 === 2) {
                translateData.author = 'laolei';
            }
            if (odd % 4 === 0) {
                translateData.author = 'leo';
            }
            if (odd % 4 === 3) {
                translateData.author = 'xianzhi';
            }
            Translate.createNew(translateData, function(err, translate) {
                Section.find({
                    _id: section
                }).exec(function(err, sections) {
                    sections[0].translates.push(translate._id);
                    sections[0].save(function(err, result) {
                        next();
                        // console.log(result);
                    });
                });
            });
        }, function(err) {
            done();
        });
    }, function(err) {
        process.exit(-1);
    });
});