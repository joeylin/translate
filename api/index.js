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

var getDocToc = function(req, res) {
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
var getDocDetail = function(req, res) {
    var name = req.params.name;
    var userList = {};
    var total = 0;
    Doc.find({
        name: name
    }).populate('chapters').exec(function(err, doc) {
        var chapters = doc[0].chapters;
        async.eachSeries(chapters, function(chapter, done) {
            total = total + chapter.sections.length;
            async.eachSeries(chapter.sections, function(section, next) {
                getOneTranslate(section, function(err,translate) {
                    if (!translate) {
                        return false;
                    }
                    if (!userList[translate.user]) {
                        userList[translate.user] = 1;
                    } else {
                        userList[translate.user] += 1;
                    }
                    next();
                });
            }, function(err) {
                done();
            });
        })
    }, function(err) {
        for (var key in userList) {
            userList[key] = parseInt(userList[key] / total * 100);
        }
        var complete = getComplete(userList);
        var sortedUser = sortObject(userList);
        res.send({
            code: 200,
            complete: complete,
            userList: sortObject,
            followers: doc[0].followers
        });
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
                    isFinished: section.isFinished
                };
                result.sections.push(sec);
                next();
            });
        }, function(err) {
            result.code = 200;
            result.contributors = getTopUser(result);
            res.send(result);
        });
    });
    function getTopUser(chapter) {
        var sections = chapter.sections;
        var total = sections.length;
        var userList = {};

        sections.map(function(section, key) {
            if (!section.translate) {
                return false;
            }
            if (!userList[section.translate.user]) {
                userList[section.translate.user] = 1;
            } else {
                userList[section.translate.user] += 1;
            }
        }); 

        for (var key in userList) {
            userList[key] = parseInt(userList[key] / total * 100, 10);
        }
        return sortObject(userList);
    }
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
var unfinish = function(req, res) {
    var id = req.body.id;
    var userId = req.body.userId;
    Section.find({
        _id: id
    }, function(err, section) {
        if (err) {
            return false;
        }
        var sec = section[0];
        sec.unsetFinished(userId);
        res.send({
            code: 200
        });
    });
};
var followDoc = function(req, res) {
    var uid = req.body.uid;
    var doc = req.params.doc;
    Doc.find({
        name: doc
    }, function(err, doc) {
        var _doc = doc[0];
        if (err) {
            return res.send({
                code: 404,
                info: 'doc cant find'
            });
        }
        User.find({
            _id: uid
        }, function(err, user) {
            var _user = user[0];
            if (err) {
                return res.send({
                    code: 404,
                    info: 'user cant find'
                });
            }
            if (_doc.followers.indexOf(_user._id) === -1) {
                _doc.followers.push(_user._id);
                    _doc.save(function(err, doc) {
                    return res.send({
                        code: 200
                    });
                });
            } 
        });
    });
};
var unfollowDoc = function(req, res) {
    var uid = req.body.uid;
    var doc = req.params.doc;
    Doc.find({
        name: doc
    }, function(err, doc) {
        var _doc = doc[0];
        if (err) {
            return res.send({
                code: 404,
                info: 'doc cant find'
            });
        }
        User.find({
            _id: uid
        }, function(err, user) {
            var _user = user[0];
            if (err) {
                return res.send({
                    code: 404,
                    info: 'user cant find'
                });
            }
            _doc.followers.splice(_doc.followers.indexOf(_user._id),1);
            _doc.save(function(err, doc) {
                return res.send({
                    code: 200
                });
            });
        });
    });
};
var createDoc = function(req, res) {
    var name = req.body.name;
    var des = req.body.des;
    var createBy = req.body.userId;

    Doc.createNew({
        name: name,
        des: des,
        createBy: createBy
    }, function(err, doc) {
        if (err) {
            return res.send({
                code: 404,
                info: err.message
            });
        }
        res.send({
            code: 200,
            doc: doc
        });
    })
};
var checkDocName = function(req, res) {
    var name = req.params.name;
    Doc.find({
        name: name
    }, function(err, doc) {
        if (err) {
            return res.send({
                code: 200
            });
        } 
        res.send({
            code: 404
        });
    })
};
var addChapter = function(req, res) {
    var doc = req.params.doc;
    var content = req.body.content;

    Doc.find({
        name: doc
    }, function(err, doc) {
        var data = {
            doc: doc[0]._id,
            name: req.body.name
        };
        Chapter.createNew(data, function(err, chapter) {
            if (err) {
                res.send({
                    code: 404,
                    info: 'save failed'
                });
            }
            var plist = parseChapter(content);
            async.eachSeries(plist, function(item, next) {
                var sectionData = {
                    content: item.content,
                    dataType: item.type,
                    chapter: chapter._id,
                };
                Section.createNew(sectionData, function(err, section) {
                    if (err) {
                        console.log('err section');
                        return res.send({
                            code: 404,
                            info: 'save failed'
                        });
                    }
                    chapter.sections.push(section._id);
                    next();
                });
            }, function(err) {
                var index = doc[0].chapters.length;
                chapter.index = index;
                chapter.save(function(err,chapter) {
                    doc[0].chapters.push(chapter._id);
                    doc[0].save(function(err,doc) {
                        res.send({
                            code: 200
                        });
                    });
                });
            });    
        });
    });
};
var delChapter = function(req, res) {
    var doc = req.params.doc;
    var id = req.body.id;

    Chapter.find({
        doc: doc,
        _id: id
    }, function(err, doc) {
        if (err) {
            return res.send({
                code: 404,
                info: 'del fail'
            });
        }
        res.send({
            code: 200
        });
    })
};

module.exports = function(app) {
    app.get('/api/doc/:name', getDocToc);
    app.get('/api/doc/:name/detail', getDocDetail);
    app.get('/api/chapter/:doc/:name', getChapter);
    app.post('/api/translate/save', saveTranslate);
    app.post('/api/section/finish', setFinish);
    app.post('/api/section/unfinish', unfinish);
    app.post('/api/follow/doc/:doc/add', followDoc);
    app.post('/api/follow/doc/:doc/del', unfollowDoc);

    app.post('/api/edit/doc/create', createDoc);
    app.get('/api/edit/doc/:doc/checkDocName', checkDocName);
    app.post('/api/edit/doc/:doc/addChapter', addChapter);
    app.post('/api/edit/doc/:doc/delChapter', delChapter);
};

function getComplete(userList) {
    var complete = 0;
    for (var key in userList) {
        complete += userList[key];
    }
    return complete;
}
function sortObject(userList) {
    var array = [];
    for (var key in userList) {
        array.push({
            name: key,
            value: userList[key]
        });
    }
    array.sort(function(a, b) {
        return b.value > a.value;
    });

    return array;
}
function parseChapter(c) {
    // chapter is markdown formate
    var plist = c.split(/\r?\n\r?\n/);
    console.log('  [%d块]', plist.length);

    // 重新整理内容，判断数据类型
    var list = [];
    plist.forEach(function(p) {

        // 统一换行符
        p = standardLineBreak(p);

        var lines = p.split(/\n/);

        // 假如第一行是空行，则去掉
        if (lines[0].trim() === '') {
            lines.shift();
            p = lines.join('\n');
        }

        if (lines.length < 1) return;

        // 识别段落类型
        var type = '';
        if (lines.length === 1) {
            if (/^#+\s+.+/.test(lines[0])) {
                type = 'title';
            } else if (/<!--([^=]+)=([^\-]+)-->/.test(lines[0])) {
                type = 'meta';
            } else if (/^Stability: ([0-5])(?:\s*-\s*)?(.*)$/.test(lines[0].trim())) {
                type = 'stability';
            } else if (lines[0].substr(0, 4) === '    ') {
                type = 'code';
            } else {
                type = 'paragraph';
            }
        } else {
            // 每一行都是以四个空格开始，是代码块
            type = 'code';
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].substr(0, 4) !== '    ') {
                    type = 'paragraph';
                    break;
                }
            }
            // 首行是``` 以及尾行是 ``` 的也是代码块
            if (type !== 'code') {
                if (lines[0].substr(0, 3) === '```' || lines[lines.length - 1].substr(-3) === '```') {
                    type = 'code';
                }
            }
            // 第二行有3个等于号是标题
            if (type === 'paragraph') {
                if (lines.length === 2 && /^===+$/.test(lines[1])) {
                    type = 'title';
                }
            }
        }

        list.push({
            content: p,
            type: type
        });
    });
    plist = list;

    // 合并相邻的代码块
    // 找出相邻的代码块
    for (var i = 0; i < plist.length; i++) {
        if (plist[i].type === 'code') {
            var c = 1;
            while (true) {
                if (plist[i + c] && plist[i + c].type === 'code') {
                    c++;
                } else {
                    break;
                }
            }
            if (c > 1) {
                var newContent = standardLineBreak(plist.slice(i, i + c).map(function(item) {
                    return item.content;
                }).join('\n\n'));
                plist[i].content = newContent;
                plist.splice(i, c - 1);
            }
        }
    }
    return plist;
};

