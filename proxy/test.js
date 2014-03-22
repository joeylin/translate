exports.User = require('./user');
exports.TopicTag = require('./tag');

// exports.Doc = require('./doc');
// exports.Chapter = require('./chapter');
exports.Section = require('./section');
exports.Translate = require('./translate');




var Doc = require('./doc');
// Doc.newAndSave('yao', 'myname', 'xxxxx', null, null, function(err, doc) {

// });
// Doc.newAndSave('lin', 'myname--lin', 'xxxxsfsx', null, null, function(err, doc) {

// });
// Doc.newAndSave('node.js', 'myname--node', 'xxxxsfsx', null, null, function(err, doc) {
//     // console.log(doc);
// });
// Doc.newAndSave('Angular.js', 'myname--Angular', 'xxxxsfsx', null, null, function(err) {
//     // console.log(doc);
// });
// Doc.newAndSave('Less', 'myname--Less', 'xxxxsfsx', null, null, function(err, doc) {
//     // console.log(doc);
// });



Doc.getDocByName('Less', function(err, doc) {
    // console.log(err, doc);
});
Doc.getDocByName('yao', function(err, doc) {
    // console.log(err, doc);
});

var Chapter = require('./chapter');

Doc.getDocByName('node.js', function(err, doc) {
    var result = doc[0];
    // debugger;
    Chapter.newAndSave('chapter1', 0, null, result._id, function(err, chapter) {
        debugger;
        result.chapters.push(chapter);
        result.save(function(err, doc) {
            // console.log(err, doc);
        });
        // console.log(err, chapter);
    });
    Chapter.newAndSave('chapter2', 1, null, result._id, function(err, chapter) {
        result.chapters.push(chapter);
        result.save(function(err, doc) {
            // console.log(err, doc);
        });
        // console.log(err, chapter);
    });
    Chapter.newAndSave('chapter3', 2, null, result._id, function(err, chapter) {
        result.chapters.push(chapter);
        result.save(function(err, doc) {
            // console.log(err, doc);
        });
        // console.log(err, chapter);
    });
    Chapter.newAndSave('chapter4', 3, null, result._id, function(err, chapter) {
        result.chapters.push(chapter);
        result.save(function(err, doc) {
            // console.log(err, doc);
        });
        // console.log(err, chapter);
    });
    debugger;
    // get chapters
    Doc.getDocAndChapter(result._id, function(err, doc) {
        console.log(err, result._id, doc[0].chapters);
    });

});