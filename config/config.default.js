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
      secretKey: '-X3',
      bucket: '',
      bucketHost: ''
  },
  // gunmail分配的邮件地址。
  email: {
      service: '',
      user: '',
      pass: ''
  }
};

module.exports = config;
module.exports.config = config;