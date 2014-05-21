'use strict';
/*global angular*/
window.jsGen = true;
angular.module('jsGen', ['ngAnimate', 'jsGen.tools', 'jsGen.router', 'jsGen.filters', 'jsGen.services', 'jsGen.locale', 'jsGen.directives', 'jsGen.controllers']).
config(['$httpProvider', 'app',
    function($httpProvider, app) {
        // global loading status
        var count = 0,
            loading = false,
            status = {
                count: 0,
                total: 0
            };

        status.cancel = function() {
            count = 0;
            loading = false;
            this.count = 0;
            this.total = 0;
            app.loading(false, this); // end loading
        };

        // global loading start
        $httpProvider.defaults.transformRequest.push(function(data) {
            count += 1;
            status.count = count;
            status.total += 1;
            if (!loading) {
                window.setTimeout(function() {
                    if (!loading && count > 0) {
                        loading = true;
                        app.loading(true, status);
                    }
                }, 1000); // if no response in 1000ms, begin loading
            }
            return data;
        });
        // global loading end
        $httpProvider.defaults.transformResponse.push(function(data) {
            count -= 1;
            status.count = count;
            if (loading && count === 0) {
                status.cancel();
            }
            return data;
        });
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
    'mdParse', 'mdEditor', 'CryptoJS', 'promiseGet', 'myConf', 'anchorScroll', 'isVisible', 'applyFn', 'param', 'store', 'getToc',
    function(app, $q, $rootScope, $routeParams, $location, $timeout, $filter, $locale,
        getFile, tools, toast, timing, cache, restAPI, sanitize, mdParse, mdEditor, CryptoJS, promiseGet, myConf, anchorScroll, isVisible, applyFn, param, store, getToc) {
        var unSave = {
            stopUnload: false,
            nextUrl: ''
        },
            global = $rootScope.global = {
                isLogin: false,
                isEdit: false,
                info: {},
                components: {}
            },
            jqWin = $(window);

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
        app.promiseGet = promiseGet;
        app.myConf = myConf;
        app.rootScope = $rootScope;
        angular.extend(app, tools); //添加jsGen系列工具函数

        app.loading = function(value, status) {
            $rootScope.loading.show = value;
        };
        $rootScope.$on('$routeChangeSuccess', function(event, next, current) {
            console.log(next);
        });
    }
]);