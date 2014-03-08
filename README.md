在线翻译系统
===========

安装
====

系统环境要求：

+ mongodb
+ Node.js >= 0.8

```bash
git clone https://github.com/joeylin/translate.git
cd translate
cp config.default.js config.js
```

```bash
npm install
node app
```

工作原理
========

Node.js 的 API 文档是使用 Markdown 格式来编写的，这种文档有一个共同特征：每个
段落都是通过一个空行来分割的。

分割为多个段落，存储到数据库中。

每个段落都会根据其内容，用 `md5()` 来生成一个 `hash` 属性，翻译的时候，每条翻译
结果也对应与该段落的 `hash`。

目录和文件 (menus and files)
==========================

    +model                  // MongoDB数据库访问层
        -index.js               // 网站全局信息访问接口
        -collection.js          // 合集系统访问接口
        -message.js             // 站内信息系统访问接口
        -tag.js                 // 标签系统访问接口
        -user.js                // 用户系统访问接口
    +proxy                  // 数据库访问抽象层
        -index.js               // 网站全局信息API接口
        -article.js             // 文章和评论系统API接口
        -collection.js          // 合集系统API接口
        -message.js             // 站内信息系统API接口
        -tag.js                 // 标签系统API接口
        -user.js                // 用户系统API
    +middlewares            // 中间层组件
        -check_signin.js        // 文章和评论系统API接口
    +utils                  // 通用工具模块
        -anyBaseConverter.js    // 通用进制转换器
        -cacheLRU.js            // LRU缓存模块
        -cacheTL.js             // TL缓存模块
        -email.js               // SMTP Email模块
        -json.js                // 数据库格式模板
        -msg.js                 // 程序信息
        -tools.js               // 核心工具函数
    +logs                   // 日志目录，网站运行后产生内容
    +node_modules           // Node.js模块目录，npm install后产生内容
    +public                 // 浏览器端AngularJS WEB应用
        +css
        +font-awesome           //很酷的web icon
        +libs
        +imgs
        +js
            +lib                    // AngularJS、jQuery等js模块
            -app.js                 // 全局初始化模块
            -controllers.js         // 控制器模块
            -directives.js          // 指令模块
            -filters.js             // 过滤器模块
            -locale_zh-cn.js        // 语言包
            -router.js              // 路由模块
            -services.js            // 通用服务模块
            -tools.js               // 工具函数模块
        +md                         // MarkDown文档
        +tpl                        // html模板
        -favicon.ico
        -index.html             // AngularJS WEB应用入口文件
    +tmp                    // 缓存目录
        +static                 // 压缩js、css缓存目录，必须
        +tpl                    // html模板文件缓存目录
        +upload                 // 上传文件缓存目录
    -app.js                 // Node.js入口文件
    -package.json           // 信息文件