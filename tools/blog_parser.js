/**
 *  Blog Parser
 */

var cheerio = require('cheerio');
// var sanitize = require('validator').sanitize;

var htmlParser = function(data) {
    var $ = cheerio.load(data);
    var description;
    var title = $('h1');
    if (title.length !== 0) {
        description = title.next();
    }
    var content = $('p').parent();
    return {
        title: title,
        content: content
    };
};

var markdownParser = function(data) {
    var $ = cheerio.load(data);
    var title = $('h1');
    var content = $('article');
    return {
        title: title,
        content: content
    };
};

exports.htmlParser = htmlParser;
exports.markdownParser = markdownParser;