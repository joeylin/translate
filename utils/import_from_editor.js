// parse content from editor

var standardLineBreak = require('./utils').standardLineBreak;

var parseFromEditor = function(c) {
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

exports.parseFromEditor = parseFromEditor;