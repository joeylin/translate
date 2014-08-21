
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
      accessKey: 'RTfz66gR4FRkqjAYr36WgiB04KpexfsAejR5d6jw',
      secretKey: 'JOkxMLsHGvmJCtmVCYZIRXmpboloBQ3y_Hvjy-X3',
      bucket: 'valuenet',
      bucketHost: 'valuenet.qiniudn.com'
  },
  // gunmail分配的邮件地址。
  email: {
      service: 'mailgun',
      user: 'postmaster@sandbox58841ccd72d24cbb9ffeedc1448eaf7b.mailgun.org',
      pass: 'linyao00'
  },
  skins: [{
    header: 'http://img.t.sinajs.cn/t5/skin/public/profile_cover/006.jpg',
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
  }],
  // user: 
  // -profile 207x180 url-big
  // -home_avatar 75x75 url-normal
  // -content_avatar 50x50 url-small
  // -nav_avatar 18x18 url-xs
  //
  // group: 
  // -home 173x173 url-home
  // -list 75x75 url-normal
  // -trend 50x50 url-small
  //
  // job:
  // home 173x173 url-home
  // list 64x64 url-normal2
  // sidebar 36x36 url-sm
  avatar: {
    user: 'http://valuenet.qiniudn.com/user-avatar.jpg',
    group: 'http://valuenet.qiniudn.com/group-avatar.png',
    company: 'http://valuenet.qiniudn.com/company-avatar.jpg', // for job publish
  }
};

module.exports = config;
module.exports.config = config;