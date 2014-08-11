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
    'mdParse',  'CryptoJS',  'myConf', 'anchorScroll', 'isVisible', 'applyFn', 'param', 'store', '$http',
    function(app, $q, $rootScope, $routeParams, $location, $timeout, $filter, $locale,
        getFile, tools, toast, timing, cache, restAPI, sanitize, mdParse, CryptoJS, myConf, anchorScroll, isVisible, applyFn, param, store, $http) {

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
        app.applyFn = applyFn;
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
        angular.extend(app, tools); 

        app.user = window.user;
        $rootScope.current = {};
        $rootScope.global.user = window.user;
        $rootScope.global.shareCount = window.shareCount;
        $rootScope.$on('$routeChangeStart', function(event, next, current) {
            if (next && next.$$route) {
                $rootScope.current.path = next.$$route.path;
            }
        });

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
        setTimeout(function() {
            $http.get('/api/notify').success(function(data) {
                $rootScope.request = {};
                $rootScope.request.comment = data.comment;
                $rootScope.request.at = data.at;
                $rootScope.request.connect = data.connect;
                $rootScope.request.group = data.group;

                var notice = $rootScope.notice = {};
                notice.connect = data.connect;
                notice.group = data.group;
                notice.info = data.info;
                
                $rootScope.getNotice = function() {
                    $http.get('/api/notify/shortNotice').success(function(result) {
                        notice.content = result.content;
                        notice.hasMore = result.hasMore;
                        notice.info = result.info;
                        $rootScope.showNotice = true;
                    });
                };
            });
        },100);
            
    }
]);