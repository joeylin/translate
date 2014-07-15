'use strict';
/*global angular*/

angular.module('jsGen.filters', []).
filter('placeholder', ['tools',
    function(tools) {
        return function(str) {
            return tools.toStr(str) || '-';
        };
    }
]).filter('match', ['$locale',
    function($locale) {
        return function(value, type) {
            return $locale.FILTER[type] && $locale.FILTER[type][value] || '';
        };
    }
]).filter('switch', ['$locale',
    function($locale) {
        return function(value, type) {
            return $locale.FILTER[type] && $locale.FILTER[type][+ !! value] || '';
        };
    }
]).filter('checkName', ['tools',
    function(tools) {
        return function(text) {
            var reg = /^[(\u4e00-\u9fa5)a-z][(\u4e00-\u9fa5)a-zA-Z0-9_]{1,}$/;
            text = tools.toStr(text);
            return reg.test(text);
        };
    }
]).filter('length', ['utf8', 'tools',
    function(utf8, tools) {
        return function(text) {
            text = tools.toStr(text);
            return utf8.stringToBytes(text).length;
        };
    }
]).filter('cutText', ['utf8', 'tools',
    function(utf8, tools) {
        return function(text, len) {
            text = tools.trim(text);
            var bytes = utf8.stringToBytes(text);
            len = len > 0 ? len : 0;
            if (bytes.length > len) {
                bytes.length = len;
                text = utf8.bytesToString(bytes);
                text = text.slice(0, -2) + '…';
            }
            return text;
        };
    }
]).filter('formatDate', ['$filter', '$locale',
    function($filter, $locale) {
        return function(date, full) {
            var o = Date.now() - date,
                dateFilter = $filter('date');
            if (full) {
                return dateFilter(date, $locale.DATETIME.fullD);
            } else if (o > 259200000) {
                return dateFilter(date, $locale.DATETIME.shortD);
            } else if (o > 86400000) {
                return Math.floor(o / 86400000) + $locale.DATETIME.dayAgo;
            } else if (o > 3600000) {
                return Math.floor(o / 3600000) + $locale.DATETIME.hourAgo;
            } else if (o > 60000) {
                return Math.floor(o / 60000) + $locale.DATETIME.minuteAgo;
            } else {
                return $locale.DATETIME.secondAgo;
            }
        };
    }
]).filter('formatTime', ['$locale',
    function($locale) {
        return function(seconds) {
            var re = '',
                q = 0,
                o = seconds > 0 ? Math.round(+seconds) : Math.floor(Date.now() / 1000),
                TIME = $locale.DATETIME;

            function calculate(base) {
                q = o % base;
                o = (o - q) / base;
                return o;
            }
            calculate(60);
            re = q + TIME.second;
            calculate(60);
            re = (q > 0 ? (q + TIME.minute) : '') + re;
            calculate(24);
            re = (q > 0 ? (q + TIME.hour) : '') + re;
            return o > 0 ? (o + TIME.day + re) : re;
        };
    }
]).filter('formatBytes', ['$locale',
    function($locale) {
        return function(bytes) {
            bytes = bytes > 0 ? bytes : 0;
            if (!bytes) {
                return '-';
            } else if (bytes < 1024) {
                return bytes + 'B';
            } else if (bytes < 1048576) {
                return (bytes / 1024).toFixed(3) + ' KiB';
            } else if (bytes < 1073741824) {
                return (bytes / 1048576).toFixed(3) + ' MiB';
            } else {
                return (bytes / 1073741824).toFixed(3) + ' GiB';
            }
        };
    }
]).filter('orderClass', function() {
    return function(direction) {
        if (direction === -1)
            return "fa-sort-desc";
        else
            return "fa-sort-asc";
    };
}).filter('paging', function() {
    return function(items, index, pageSize) {
        if (!items)
            return [];

        var offset = (index - 1) * pageSize;
        return items.slice(offset, offset + pageSize);
    };
}).filter('size', function() {
    return function(items) {
        if (!items) {
            return 0;
        }
        return items.length || 0;
    };
}).filter('count', function() {
    return function(text) {
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
        return 140 - textareaGetLength(text);
    };
}).filter('wCount', ['wordCount',
    function(wordCount) {
        return function(text) {
            return 140 - wordCount(text);
        };
    }
]).filter('classify', function() {
    return function(items, name) {
        if (!items) {
            return 0;
        }
        var count = 0;
        items.map(function(item) {
            if (item.relate.split(',').indexOf(name)) {
                count++;
            }
        });
        return count;
    };
});