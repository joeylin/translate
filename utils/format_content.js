/**
 * 格式化英文内容，统一换行符，去掉首行的空行，重新生成hash值
 */

var async = require('async');
var config = require('../config');
var utils = require('./utils');
var db = config.mysql;


console.log('查询出所有记录...');
db.select('origin_api', '*', '1', function (err, list) {
  if (err) throw err;

  console.log('  共%d条数据', list.length);

  async.eachSeries(list, function (item, next) {

    // 统一换行符
    var content = utils.standardLineBreak(item.content);
    var lines = content.split(/\n/);
    if (lines[0].trim() === '') {
      lines.shift();
      content = lines.join('\n');
    }

    var hash = utils.md5(content).toLowerCase();
    if (hash === item.hash) return next();

    console.log('更新：[%d] %s => %s', item.id, item.hash, hash);

    db.update('origin_api', '`id`=' + item.id, {hash: hash, content: content}, function (err) {
      if (err) return next(err);

      db.update('translate_api', '`origin_hash`=' + db.escape(item.hash), {origin_hash: hash}, function (err, info) {
        if (err) return next(err);

        console.log('  更新了%d条翻译', info.affectedRows);
        next();
      });
    });

  }, function (err) {
    if (err) throw err;

    console.log('完成');
    process.exit();
  });
});