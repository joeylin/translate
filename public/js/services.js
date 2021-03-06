angular.module('jsGen.services', ['ngResource', 'ngCookies']).
factory('restAPI', ['$resource',
    function($resource) {
        return {
            doc: $resource('/api/doc/:DOC'),
            chapter: $resource('/api/chapter/:DOC/:CHAPTER'),
            user: $resource('/api/user/:ID'),
            tag: $resource('/api/tag/:ID'),
            translate: $resource('/api/chapter/:ID/:OP')
        };
    }
]).factory('cache', ['$cacheFactory',
    function($cacheFactory) {
        return {
            doc: $cacheFactory('doc', {
                capacity: 10
            }),
            user: $cacheFactory('user', {
                capacity: 20
            }),
            translate: $cacheFactory('translate', {
                capacity: 500
            })
        };
    }
]).factory('myConf', ['$cookieStore', 'tools',
    function($cookieStore, tools) {
        function checkValue(value, defaultValue) {
            return tools.isNull(value) ? defaultValue : value;
        }

        function myCookies(name, initial) {
            return function(value, pre, defaultValue) {
                pre = tools.toStr(pre) + name;
                defaultValue = checkValue(defaultValue, initial);
                var result = checkValue($cookieStore.get(pre), defaultValue);
                if (!tools.isNull(value) && result !== checkValue(value, defaultValue)) {
                    $cookieStore.put(pre, value);
                    result = value;
                }
                return result;
            };
        }
        return {
            pageSize: myCookies('PageSize', 10),
            sumModel: myCookies('sumModel', false)
        };
    }
]).factory('anchorScroll', function() {
    function toView(element, top, height) {
        var winHeight = $(window).height();
        element = $(element);
        height = height > 0 ? height : winHeight / 10;
        $('html, body').animate({
            scrollTop: top ? (element.offset().top - height) : (element.offset().top + element.outerHeight() + height - winHeight)
        }, {
            duration: 200,
            easing: 'linear',
            complete: function() {
                if (!inView(element)) {
                    element[0].scrollIntoView( !! top);
                }
            }
        });
    }

    function inView(element) {
        element = $(element);

        var win = $(window),
            winHeight = win.height(),
            eleTop = element.offset().top,
            eleHeight = element.outerHeight(),
            viewTop = win.scrollTop(),
            viewBottom = viewTop + winHeight;

        function isInView(middle) {
            return middle > viewTop && middle < viewBottom;
        }

        if (isInView(eleTop + (eleHeight > winHeight ? winHeight : eleHeight) / 2)) {
            return true;
        } else if (eleHeight > winHeight) {
            return isInView(eleTop + eleHeight - winHeight / 2);
        } else {
            return false;
        }
    }
    return {
        toView: toView,
        inView: inView
    };
}).factory('isVisible', function() {
    return function(element) {
        var rect = element[0].getBoundingClientRect();
        return Boolean(rect.bottom - rect.top);
    };
}).factory('applyFn', ['$rootScope',
    function($rootScope) {
        return function(fn, scope) {
            fn = angular.isFunction(fn) ? fn : angular.noop;
            scope = scope && scope.$apply ? scope : $rootScope;
            fn();
            if (!scope.$$phase) {
                scope.$apply();
            }
        };
    }
]).factory('timing', ['$rootScope', '$q', '$exceptionHandler',
    function($rootScope, $q, $exceptionHandler) {
        function timing(fn, delay, times) {
            var timingId, count = 0,
                defer = $q.defer(),
                promise = defer.promise;

            fn = angular.isFunction(fn) ? fn : angular.noop;
            delay = parseInt(delay, 10);
            times = parseInt(times, 10);
            times = times >= 0 ? times : 0;
            timingId = window.setInterval(function() {
                count += 1;
                if (times && count >= times) {
                    window.clearInterval(timingId);
                    defer.resolve(fn(count, times, delay));
                } else {
                    try {
                        fn(count, times, delay);
                    } catch (e) {
                        defer.reject(e);
                        $exceptionHandler(e);
                    }
                }
                if (!$rootScope.$$phase) {
                    $rootScope.$apply();
                }
            }, delay);

            promise.$timingId = timingId;
            return promise;
        }
        timing.cancel = function(promise) {
            if (promise && promise.$timingId) {
                clearInterval(promise.$timingId);
                return true;
            } else {
                return false;
            }
        };
        return timing;
    }
]).factory('promiseGet', ['$q',
    function($q) {
        return function(param, restAPI, cacheId, cache) {
            var result, defer = $q.defer();

            result = cacheId && cache && cache.get(cacheId);
            if (result) {
                defer.resolve(result);
            } else {
                restAPI.get(param, function(data) {
                    if (cacheId && cache) {
                        cache.put(cacheId, data);
                    }
                    defer.resolve(data);
                }, function(data) {
                    defer.reject(data.error);
                });
            }
            return defer.promise;
        };
    }
]).factory('toast', ['$log', 'tools',
    function($log, tools) {
        var toast = {},
            methods = ['info', 'error', 'success', 'warning'];

        angular.forEach(methods, function(x) {
            toast[x] = function(message, title) {
                var log = $log[x] || $log.log;
                title = tools.toStr(title);
                log(message, title);
                message = angular.isObject(message) ? angular.toJson(message) : tools.toStr(message);
                toastr[x](message, title);
            };
        });
        toastr.options = angular.extend({
            positionClass: 'toast-bottom-full-width'
        }, toast.options);
        toast.clear = toastr.clear;
        return toast;
    }
]).factory('pretty', function() {
    return prettyPrint;
}).factory('param', function() {
    return $.param;
}).factory('CryptoJS', function() {
    return CryptoJS;
}).factory('utf8', function() {
    return utf8;
}).factory('store', function() {
    return store;
}).factory('mdParse', ['tools',
    function(tools) {
        return function(html) {
            return marked(tools.toStr(html));
        };
    }
]).factory('sanitize', ['tools',
    function(tools) {
        var San = Sanitize,
            config = San.Config,
            sanitize = [
                new San({}),
                new San(config.RESTRICTED),
                new San(config.BASIC),
                new San(config.RELAXED)
            ];
        // level: 0, 1, 2, 3
        return function(html, level) {
            var innerDOM = document.createElement('div'),
                outerDOM = document.createElement('div');
            level = level >= 0 ? level : 3;
            innerDOM.innerHTML = tools.toStr(html);
            outerDOM.appendChild(sanitize[level].clean_node(innerDOM));
            return outerDOM.innerHTML;
        };
    }
]).factory('setPos', ['tools',
    function(tools) {
        var setpos = function(o){ 
          if (o.setSelectionRange) { 
              setTimeout(function(){
              o.setSelectionRange(o.value.length, o.value.length);  
              o.focus()} ,0) 
          }else if (o.createTextRange) {
            var textrange=o.createTextRange();
            textrange.moveStart("character",o.value.length);
            textrange.moveEnd("character",0);
            textrange.select();
          }
        };
        return setpos;
    }
]).factory('wordCount', ['mdParse', 'sanitize', 'pretty', 'tools',
    function(mdParse, sanitize, pretty, tools) {
        var textareaGetLength = (function() {
            var trim = function(h) {
                try {
                    return h.replace(/^\s+|\s+$/g, "")
                } catch (j) {
                    return h
                }
            }
            var byteLength = function(b) {
                if (typeof b == "undefined") {
                    return 0
                }
                var a = b.match(/[^\x00-\x80]/g);
                return (b.length + (!a ? 0 : a.length))
            };

            return function(q, g) {
                g = g || {};
                g.max = g.max || 140;
                g.min = g.min || 41;
                g.surl = g.surl || 20;
                var p = trim(q).length;
                if (p > 0) {
                    var j = g.min,
                        s = g.max,
                        b = g.surl,
                        n = q;
                    var r = q.match(/(http|https):\/\/[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+([-A-Z0-9a-z\$\.\+\!\_\*\(\)\/\,\:;@&=\?~#%]*)*/gi) || [];
                    var h = 0;
                    for (var m = 0,
                            p = r.length; m < p; m++) {
                        var o = byteLength(r[m]);
                        if (/^(http:\/\/t.cn)/.test(r[m])) {
                            continue
                        } else {
                            if (/^(http:\/\/)+(weibo.com|weibo.cn)/.test(r[m])) {
                                h += o <= j ? o : (o <= s ? b : (o - s + b))
                            } else {
                                h += o <= s ? b : (o - s + b)
                            }
                        }
                        n = n.replace(r[m], "")
                    }
                    return Math.ceil((h + byteLength(n)) / 2)
                } else {
                    return 0
                }
            }
        })();
        // param: String test text
        // param: Number max number
        return textareaGetLength;
    }
]);