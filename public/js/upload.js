// // init qiniu
// var $progress = $('#upload-progress');
// var $img = $('#changeAvatar');
// initQiniuUploader({
//     input: 'avatar-upload',
//     progress: function(p, s, n) {
//         var text = 'Uploading ' + n + ' (' + s + ')';
//         var title = p + '%';
//         $progress.text(title);
//     },
//     putFailure: function(msg) {
//         messageBox.error('Upload failure', msg);
//         $progress.addClass('error').text('failure');
//     },
//     putFinished: function(fsize, res, taking) {
//         // res.key
//         var url = '//' + res.host + '/' + res.key;
//         // 完成进度
//         $progress.text('Success').fadeOut(1000);
//         $img.src = url + '-big';
//     }
// });


// 初始化七牛上传组件
function initQiniuUploader(options) {

    // 生成上传文件名
    function genKey() {
        function n2(n) {
            return (n < 10 ? '0' : '') + n;
        }
        var d = new Date();
        return [d.getFullYear(), n2(d.getMonth() + 1), n2(d.getDate()), randomString(32)].join('/');
    }

    // 生成随机字符串
    function randomString(size) {
        size = size || 6;
        var code_string = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var max_num = code_string.length + 1;
        var new_pass = '';
        while (size > 0) {
            new_pass += code_string.charAt(Math.floor(Math.random() * max_num));
            size--;
        }
        return new_pass;
    }

    // 待上传文件列表

    //设置颁发token的Url,该Url返回的token用于后续的文件上传
    //Q.SignUrl('/uploads/token');
    //可以在此回调中添加提交至服务端的额外参数,用于生成上传token
    //此函数会在上传前被调用
    if (options.beforeUp) Q.addEvent('beforeUp', options.beforeUp);
    //上传进度回调
    //@p, 0~100
    //@s, 已格式化的速度
    //if (options.progress) Q.addEvent('progress', options.progress);
    //上传失败回调
    //@msg, 失败消息
    //if (options.putFailure) Q.addEvent('putFailure', options.putFailure);
    //上传完成回调
    //@fsize, 文件大小(MB)
    //@res, 上传返回结果，默认为{hash:<hash>,key:<key>}
    //@taking, 上传使用的时间
    //if (options.putFinished) Q.addEvent('putFinished', options.putFinished);
    //发现待发上传的文件是未完成的事件
    //@his,文件名
    if (options.historyFound) Q.addEvent('historyFound', options.historyFound);

    // 上传队列
    var uploadQueue = [];
    // 正在上传的文件
    var currentFile;

    // 开始上传
    function startUpload() {
        if (!bucketHost) {
            console.log('wait for upload token...');
            return;
        }
        var item = uploadQueue.shift();
        if (item) {
            console.log('uploading...', item.f, item.k);
            currentFile = item.f;
            Q.Upload(item.f, item.k);
        }
    }
    Q.addEvent('putFailure', function(msg) {
        startUpload();
        if (options.putFailure) {
            options.putFailure(msg);
        }
    });
    Q.addEvent('putFinished', function(fsize, res, taking) {
        startUpload();
        if (options.putFinished) {
            res.host = bucketHost;
            options.putFinished(fsize, res, taking);
        }
    });
    Q.addEvent('progress', function(p, s) {
        if (options.progress) {
            var n = currentFile.name;
            options.progress(p, s, n);
        }
    });

    // 获取上传Token
    var bucketHost;
    $.post('/api/token.json', function(d) {
        Q.SetToken(d.token);
        bucketHost = d.host;
        startUpload();
    }, 'json');

    // 监听选择文件事件
    // after DOM ready to bind event
    setTimeout(function() {
        $('#' + options.input).change(function() {
            var files = document.getElementById(options.input).files;
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var f = files[i];
                    var k = genKey();
                    uploadQueue.push({
                        f: f,
                        k: k
                    });
                }
                startUpload();
            }
        });
    }, 60);
}
window.initQiniuUploader = initQiniuUploader;