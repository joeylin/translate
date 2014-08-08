'use strict';
/*global angular*/
window.jsGen = true;
angular.module('jsGen', ['ngAnimate', 'jsGen.tools', 'jsGen.router', 'jsGen.filters', 'jsGen.services', 'jsGen.locale', 'jsGen.directives', 'jsGen.controllers']).
config(['$httpProvider', 'app',
    function($httpProvider, app) {
        // global error handling
        $httpProvider.interceptors.push(function() {
            return {
                response: function(res) {
                    var error, data = res.data;
                    if (data.code === 404) {
                        app.timestamp = data.timestamp;
                        error = data.info;
                    }
                    if (error) {
                        app.toast.error(error);
                        return app.q.reject(data);
                    } else {
                        return res;
                    }
                },
                responseError: function(res) {
                    var data = res.data || res,
                        status = res.status || '',
                        message = data.info || (angular.isObject(data) ? 'Error!' : data);
                    app.toast.error(message, status);
                    return app.q.reject(data);
                }
            };
        });
    }
]).run(['app', '$q', '$rootScope', '$routeParams', '$location', '$timeout', '$filter', '$locale', 'getFile', 'tools', 'toast', 'timing', 'cache', 'restAPI', 'sanitize',
    'mdParse', 'CryptoJS', 'myConf', 'anchorScroll', 'isVisible', 'applyFn', 'param', 'store','$http', 'wordCount',
    function(app, $q, $rootScope, $routeParams, $location, $timeout, $filter, $locale,
        getFile, tools, toast, timing, cache, restAPI, sanitize, mdParse, CryptoJS, myConf, anchorScroll, isVisible, applyFn, param, store, $http, wordCount) {

        var global = $rootScope.global = {
            isLogin: false,
            isEdit: false,
            info: {},
            components: {}
        };
        var jqWin = $(window);

        function resize() {
            var viewWidth = global.viewWidth = jqWin.width();
            global.viewHeight = jqWin.height();
            global.isPocket = viewWidth < 480;
            global.isPhone = viewWidth < 768;
            global.isTablet = !global.isPhone && viewWidth < 980;
            global.isDesktop = viewWidth >= 980;
        }

        window.jsGen = app;
        app.q = $q;
        app.store = store;
        app.toast = toast;
        app.param = param;
        app.timing = timing;
        app.location = $location;
        app.timeout = $timeout;
        app.timeOffset = 0;
        app.timestamp = Date.now() + 0;
        app.filter = $filter;
        app.locale = $locale;
        app.anchorScroll = anchorScroll;
        app.isVisible = isVisible;
        app.getFile = getFile;
        app.cache = cache;
        app.restAPI = restAPI;
        app.sanitize = sanitize;
        app.mdParse = mdParse;
        app.CryptoJS = CryptoJS;
        app.myConf = myConf;
        app.rootScope = $rootScope;
        angular.extend(app, tools); //添加jsGen系列工具函数

        app.author = window.author;
        global.user = window.author;
        app.group = window.group;
        app.isJoined = window.isJoined;

        // qiniu uploader
        window.initQiniuUploader({
            // input ID
            input: 'avatar-upload',
            progress: function(p, s, n) {
                var title = p + '%';
                var $progress = $('#upload-progress');
                $progress.css({
                    display: 'block'
                });
                $progress.text(title);
            },
            putFailure: function(msg) {
                var $progress = $('#upload-progress');
                $progress.addClass('error').text('failure').fadeOut(1000);
            },
            putFinished: function(fsize, res, taking) {
                // res.key
                var url = '//' + res.host + '/' + res.key;
                var $progress = $('#upload-progress');
                // 完成进度
                $progress.text('Success').fadeOut(1000);
                $rootScope.$broadcast('putFinish', url);
            }
        });

        // popup
        global.popup = {
            show: false,
            type: '',
            text: '',
            close: function() {
                global.popup.show = false;
            }
        };
        global.fork = {
            userName: '',
            groupName: '',
            groupId: '',
            forkShare: '',
            shareCount: 0
        };
        $rootScope.$on('popup', function($event, type, execFuction) {
            global.popup.type = type;
            if (type === 'shareDelete') {
                global.deleteShare = function() {
                    execFuction(function() {
                        global.popup.show = false;
                    });
                };
            }
            if (type === 'memberDelete') {
                global.deleteMember = function() {
                    execFuction(function() {
                        global.popup.show = false;
                    });
                };
            }
            if (type === 'fork') {
                global.fork.change = function() {
                    global.fork.shareCount = wordCount(global.fork.forkShare);
                };
                if (execFuction.share.isFork) {
                    global.fork.userName = execFuction.share.from.user.name;
                    global.fork.userId = execFuction.share.from.user.id;
                    global.fork.groupName = execFuction.share.from.group.name;
                    global.fork.groupId = execFuction.share.from.group.id;
                    global.fork.content = execFuction.share.from.content;
                    global.fork.forkShare = '//@' + execFuction.share.user.name + ' ' + execFuction.share.content;
                } else {
                    global.fork.userName = execFuction.share.user.name;
                    global.fork.userId = execFuction.share.user.id;
                    global.fork.groupName = app.group.name;
                    global.fork.groupId = app.group.id;  
                    global.fork.content = execFuction.share.content;
                    global.fork.date = execFuction.share.createAt;
                    global.fork.forkShare = '';
                }
                
                global.fork.submit = function() {
                    var url = '/api/share/fork';
                    if (global.fork.shareCount > 140) {
                        return false;
                    }
                    if (execFuction.share.isFork) {
                        $http.post(url, {
                            type: 'view',
                            isFork: true,
                            forkId: execFuction.share._id,
                            from: {
                                share: execFuction.share.from.share._id,
                                user: execFuction.share.from.user._id,
                                group: execFuction.share.from.group && execFuction.share.from.group.id
                            },
                            content: global.fork.forkShare
                        }).success(function(data) {
                            global.popup.show = false;
                            execFuction.share.fork += 1;
                        });
                    } else {
                        $http.post(url, {
                            type: 'view',
                            isFork: true,
                            forkId: execFuction.share._id,
                            from: {
                                share: execFuction.share._id,
                                user: execFuction.share.user._id,
                                group: app.group._id
                            },
                            content: global.fork.forkShare || '转发'
                        }).success(function(data) {
                            global.popup.show = false;
                            execFuction.share.fork += 1;
                        });
                    } 
                }; 
                global.fork.change();
                setTimeout(function() {
                    $('#forkText').focus();
                },200);
            }
            global.popup.show = true;
        });
        global.isJoined = window.isJoined;
        global.isAdmin = window.isAdmin;
        global.isCreator = window.isCreator;
        global.is_followed = window.is_followed;
        global.join = function() {
            if (!app.author) {
                global.popup.type = 'login';
                global.popup.text = '';
                global.popup.show = true;
            } else {
                global.popup.type = 'check';
                global.popup.show = true;
            }
        };
        global.triggerQuit = function() {
            global.popup.type = 'quit';
            global.popup.show = true;
        };
        global.quit = function() {
            var url = '/api/group/quit';
            var data = {
                id: app.group._id
            };
            $http.post(url, data).success(function(data) {
                global.popup.show = false;
                window.location.href = '/group/' + app.group.id;
            });
        };
        global.joinSubmit = function() {
            var url = '/api/group/joinRequest';
            var data = {
                id: app.group.id,
                content: global.inputMessage
            };
            $http.post(url, data).success(function(data) {
                global.popup.show = false;
            });
        };
        global.follow = function() {
            var url = '/api/group/follow';
            var data = {
                id: app.group._id
            };
            $http.post(url,data).success(function(data) {
                global.is_followed = true;
            });
        };
        global.unfollow = function() {
            var url = '/api/group/unfollow';
            var data = {
                id: app.group._id
            };
            $http.post(url,data).success(function(data) {
                global.is_followed = false;
            });
        };
        $rootScope.current = {};
        $rootScope.$on('$routeChangeStart', function(event, next, current) {
            if (next && next.$$route) {
                $rootScope.current.path = next.$$route.path;
            }
        });
        $http.get('/api/notify').success(function(data) {
            $rootScope.request = {};
            $rootScope.request.comment = data.comment;
            $rootScope.request.reply = data.reply;
            $rootScope.request.connect = data.connect;
            $rootScope.request.group = data.group;
        });
    }
]);