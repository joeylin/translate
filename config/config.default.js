
var config = {
  host: 'localhost',
  port: 3000,
  cookie: {
    secret: 'node',
    maxAge: 3600000 * 24 * 30
  },
  db: 'mongodb://127.0.0.1/translate',
  signin: {
    secret: 'xxxxx',
    maxAge: 3600000 * 24 * 30
  },
  name: 'translate',
  description: 'translate community',
  qiniu: {
      accessKey: '',
      secretKey: '',
      bucket: '',
      bucketHost: ''
  },
  // gunmail分配的邮件地址。
  email: {
      service: '',
      user: '',
      pass: ''
  },
  skins: [{
    header: 'http://img.t.sinajs./t5//public/profile_cover/006.jpg',
    body: '#f9f9f9'
  }, {
    header: 'http://img.t.sinajs.cn/t5/skin/public/profile_cover/050.jpg',
    body: '#f9f9f9'
  }, {
    header: 'http://img.t.sinajs.cn/t5/skin/public/profile_cover/051.jpg',
    body: '#f9f9f9'
  }, {
    header: 'http://img.t.sinajs.cn/t5/skin/public/profile_cover/003.jpg',
    body: '#f9f9f9'
  }]
};

module.exports = config;
module.exports.config = config;