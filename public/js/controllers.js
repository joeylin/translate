'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('indexCtrl', ['app', '$scope', '$routeParams', 'getList',
    function (app, $scope, $routeParams, getList) {
        var ID = '',
            restAPI = app.restAPI.article,
            myConf = app.myConf,
            global = app.rootScope.global;

        function checkRouteParams() {
            var path = app.location.path().slice(1).split('/');
            if ($routeParams.TAG || (/^T[0-9A-Za-z]{3,}$/).test(path[0])) {
                restAPI = app.restAPI.tag;
                $scope.other._id = path[0];
                $scope.other.title = $routeParams.TAG || path[0];
                $scope.parent.viewPath = '';
            } else {
                restAPI = app.restAPI.article;
                $scope.parent.viewPath = path[0] || 'latest';
            }
            ID = $routeParams.TAG || path[0] || 'latest';
        }

        function getArticleList() {
            var params = {
                ID: ID,
                p: $routeParams.p,
                s: $routeParams.s || myConf.pageSize(null, 'index', 20)
            };

            app.promiseGet(params, restAPI, app.param(params), app.cache.list).then(function (data) {
                var pagination = data.pagination || {};
                if (data.tag) {
                    $scope.other.title = data.tag.tag;
                    $scope.other._id = data.tag._id;
                }
                pagination.path = app.location.path();
                pagination.pageSize = myConf.pageSize(pagination.pageSize, 'index');
                $scope.pagination = pagination;
                $scope.articleList = data.data;
            });
        }

        global.title2 = global.description;
        $scope.parent = {
            getTpl: app.getFile.html('index-article.html'),
            viewPath: 'latest',
            sumModel: myConf.sumModel(null, 'index', false)
        };
        $scope.other = {};
        $scope.pagination = {};

        $scope.setListModel = function () {
            var parent = $scope.parent;
            parent.sumModel = myConf.sumModel(!parent.sumModel, 'index');
            myConf.pageSize(parent.sumModel ? 20 : 10, 'index');
            app.location.search({});
        };

        checkRouteParams();
        getArticleList();
        getList('comment').then(function (data) {
            data = app.union(data.data);
            app.each(data, function (x, i) {
                x.content = app.filter('cutText')(app.trim(x.content, true), 180);
            });
            $scope.hotComments = data.slice(0, 6);
        });
    }
]).controller('docCtrl', ['app', '$scope', '$routeParams', 'getDoc', 'getChapter',
    function (app, $scope, $routeParams, getDoc, getChapter) {
        var doc = $routeParams.doc;
        var chapter = $routeParams.chapter;
        $scope.doc = {
            name: $routeParams.doc,
            file: app.getFile.html('chapter.html'),
            translate: false
        };
        $scope.doc.makeTranslate = function() {
            $scope.doc.translate = !$scope.doc.translate;
            console.log('translate');
        };
        getDoc(doc).then(function(data) {
            $scope.doc.version = data.version;
            $scope.doc.toc = data.toc;
        });
        getChapter(doc,chapter).then(function(data) {
            $scope.doc.chapter = data;
        });
    }
]).controller('userLoginCtrl', ['app', '$scope',
    function (app, $scope) {
        app.clearUser();
        app.rootScope.global.title2 = app.locale.USER.login;
        $scope.login = {
            logauto: true,
            logname: '',
            logpwd: ''
        };
        $scope.reset = {
            title: '',
            type: ''
        };

        $scope.submit = function () {
            if (app.validate($scope)) {
                var data = app.union($scope.login);
                data.logtime = Date.now() - app.timeOffset;
                data.logpwd = app.CryptoJS.SHA256(data.logpwd).toString();
                data.logpwd = app.CryptoJS.HmacSHA256(data.logpwd, 'jsGen').toString();
                data.logpwd = app.CryptoJS.HmacSHA256(data.logpwd, data.logname + ':' + data.logtime).toString();

                app.restAPI.user.save({
                    ID: 'login'
                }, data, function (data) {
                    app.rootScope.global.user = data.data;
                    app.checkUser();
                    $scope.$destroy();
                    app.location.path('/home');
                }, function (data) {
                    $scope.reset.type = data.error.name;
                    $scope.reset.title = app.locale.RESET[data.error.name];
                });
            }
        };
    }
]).controller('userRegisterCtrl', ['app', '$scope',
    function (app, $scope) {
        var filter = app.filter,
            lengthFn = filter('length'),
            global = app.rootScope.global;

        app.clearUser();
        global.title2 = app.locale.USER.register;
        $scope.user = {
            name: '',
            email: '',
            passwd: '',
            passwd2: ''
        };

        $scope.checkName = function (scope, model) {
            return filter('checkName')(model.$value);
        };
        $scope.checkMin = function (scope, model) {
            return lengthFn(model.$value) >= 5;
        };
        $scope.checkMax = function (scope, model) {
            return lengthFn(model.$value) <= 15;
        };
        $scope.submit = function () {
            var user = $scope.user;
            if (app.validate($scope)) {
                var data = {
                    name: user.name,
                    email: user.email
                };
                data.passwd = app.CryptoJS.SHA256(user.passwd).toString();
                data.passwd = app.CryptoJS.HmacSHA256(data.passwd, 'jsGen').toString();

                app.restAPI.user.save({
                    ID: 'register'
                }, data, function (data) {
                    app.rootScope.global.user = data.data;
                    app.checkUser();
                    $scope.$destroy();
                    app.location.path('/home');
                });
            }
        };
    }
]).controller('homeCtrl', ['app', '$scope', '$routeParams',
    function (app, $scope, $routeParams) {
        var global = app.rootScope.global;

        if (!global.isLogin) {
            return app.location.search({}).path('/');
        }

        function tplName(path) {
            switch (path) {
            case 'follow':
            case 'fans':
                return 'user-list.html';
            case 'detail':
                return 'user-edit.html';
            case 'article':
            case 'comment':
            case 'mark':
                return 'user-article.html';
            default:
                return 'user-article.html';
            }
        }

        global.title2 = app.locale.HOME.title;
        $scope.user = global.user;
        $scope.parent = {
            getTpl: app.getFile.html(tplName($routeParams.OP)),
            isMe: true,
            viewPath: $routeParams.OP || 'index'
        };
    }
]).controller('articleCtrl', ['app', '$scope', '$routeParams', 'mdEditor', 'getList', 'getMarkdown',
    function (app, $scope, $routeParams, mdEditor, getList, getMarkdown) {
        var ID = 'A' + $routeParams.ID,
            myConf = app.myConf,
            locale = app.locale,
            global = app.rootScope.global,
            filter = app.filter,
            lengthFn = filter('length'),
            cutTextFn = filter('cutText'),
            commentCache = app.cache.comment,
            listCache = app.cache.list,
            restAPI = app.restAPI.article,
            user = global.user || {};

        user = {
            _id: user._id,
            name: user.name,
            avatar: user.avatar
        };

        function checkArticleIs(article) {
            var _id = user._id;
            if (!angular.isObject(article)) {
                return;
            }
            article.isAuthor = _id === article.author._id;
            article.isMark = app.some(article.markList, function (x) {
                return x._id === _id;
            });
            article.isFavor = app.some(article.favorsList, function (x) {
                return x._id === _id;
            });
            article.isOppose = app.some(article.opposesList, function (x) {
                return x._id === _id;
            });
            app.each(article.commentsList, function (x) {
                checkArticleIs(x);
            });
        }

        function checkLogin() {
            if (!global.isLogin) {
                app.toast.error(locale.USER.noLogin);
            }
            return global.isLogin;
        }

        function initReply() {
            var comment = $scope.comment,
                article = $scope.article;
            comment.replyToComment = '';
            comment.title = '评论：' + cutTextFn(article.title, global.TitleMaxLen - 9);
            comment.content = '';
            comment.refer = article._id;
            $scope.replyMoving.prependTo('#comments');
        }

        $scope.parent = {
            wmdPreview: false,
            contentBytes: 0,
            markdownHelp: ''
        };
        $scope.comment = {
            title: '',
            content: '',
            refer: '',
            replyToComment: ''
        };
        $scope.replyMoving = {};
        $scope.commentMoving = {};
        $scope.markdownModal = {
            title: locale.ARTICLE.markdown,
            cancelBtn: locale.BTN_TEXT.goBack
        };
        $scope.validateTooltip = app.union(app.rootScope.validateTooltip);
        $scope.validateTooltip.placement = 'bottom';
        $scope.removeCommentModal = {
            confirmBtn: locale.BTN_TEXT.confirm,
            confirmFn: function () {
                var comment = $scope.removeComment;
                app.restAPI.article.remove({
                    ID: comment._id
                }, function () {
                    app.some($scope.article.commentsList, function (x, i, list) {
                        if (x._id === comment._id) {
                            list.splice(i, 1);
                            $scope.article.comments = list.length;
                            app.toast.success(locale.ARTICLE.removed + comment.title, locale.RESPONSE.success);
                            return true;
                        }
                    });
                    $scope.removeComment = null;
                });
                return true;
            },
            cancelBtn: locale.BTN_TEXT.cancel,
            cancelFn: function () {
                $scope.removeComment = null;
                return true;
            }
        };
        $scope.remove = function (comment) {
            if (comment.isAuthor || global.isEditor) {
                $scope.removeComment = comment;
                $scope.removeCommentModal.modal(true);
            }
        };

        $scope.wmdHelp = function () {
            getMarkdown.success(function (data) {
                $scope.parent.markdownHelp = data;
                $scope.markdownModal.modal(true);
            });
        };
        $scope.wmdPreview = function () {
            $scope.parent.wmdPreview = !$scope.parent.wmdPreview;
            $scope.replyMoving.scrollIntoView(true);
        };
        $scope.checkContentMin = function (scope, model) {
            var length = lengthFn(model.$value);
            $scope.parent.contentBytes = length;
            return length >= global.ContentMinLen;
        };
        $scope.checkContentMax = function (scope, model) {
            return lengthFn(model.$value) <= global.ContentMaxLen;
        };
        $scope.reply = function (article) {
            var comment = $scope.comment;
            comment.refer = article._id;
            $scope.parent.wmdPreview = false;
            if (article._id === $scope.article._id) {
                initReply();
            } else {
                comment.replyToComment = article._id;
                comment.title = locale.ARTICLE.reply + cutTextFn(app.sanitize(app.mdParse(article.content), 0), global.TitleMaxLen - 9);
                $scope.replyMoving.appendTo('#' + article._id);
            }
            $scope.replyMoving.scrollIntoView();
        };
        $scope.getComments = function (idArray, to) {
            var idList = [],
                result = {};

            function getResult() {
                var list = [];
                app.each(idArray, function (x) {
                    if (result[x]) {
                        list.push(result[x]);
                    }
                });
                return list;
            }

            $scope.referComments = [];
            if (to && idArray && idArray.length > 0) {
                if ($scope.commentMoving.childrenOf('#' + to._id)) {
                    $scope.commentMoving.appendTo('#comments');
                    return;
                } else {
                    $scope.commentMoving.appendTo('#' + to._id);
                }
                app.each(idArray, function (x) {
                    var comment = commentCache.get(x);
                    if (comment) {
                        result[x] = comment;
                    } else {
                        idList.push(x);
                    }
                });
                $scope.referComments = getResult();
                if (idList.length > 0) {
                    restAPI.save({
                        ID: 'comment'
                    }, {
                        data: idList
                    }, function (data) {
                        app.each(data.data, function (x) {
                            checkArticleIs(x);
                            commentCache.put(x._id, x);
                            result[x._id] = x;
                        });
                        $scope.referComments = getResult();
                    });
                }
            }
        };
        $scope.highlight = function (article) {
            // this is todo
            article.status = article.status === 2 ? 1 : 2;
        };
        $scope.setMark = function (article) {
            if (checkLogin()) {
                restAPI.save({
                    ID: article._id,
                    OP: 'mark'
                }, {
                    mark: !article.isMark
                }, function () {
                    article.isMark = !article.isMark;
                    if (article.isMark) {
                        article.markList.push(user);
                    } else {
                        app.removeItem(user, '_id', article.markList);
                    }
                    app.toast.success(locale.ARTICLE[article.isMark ? 'marked' : 'unmarked']);
                });
            }
        };
        $scope.setFavor = function (article) {
            if (checkLogin()) {
                restAPI.save({
                    ID: article._id,
                    OP: 'favor'
                }, {
                    favor: !article.isFavor
                }, function () {
                    article.isFavor = !article.isFavor;
                    if (article.isFavor) {
                        article.favorsList.push(user);
                        app.removeItem(user, '_id', article.opposesList);
                        article.isOppose = false;
                    } else {
                        app.removeItem(user, '_id', article.favorsList);
                    }
                    app.toast.success(locale.ARTICLE[article.isFavor ? 'favored' : 'unfavored']);
                });
            }
        };
        $scope.setOppose = function (article) {
            if (checkLogin()) {
                restAPI.save({
                    ID: article._id,
                    OP: 'oppose'
                }, {
                    oppose: !article.isOppose
                }, function () {
                    article.isOppose = !article.isOppose;
                    if (article.isOppose) {
                        article.opposesList.push(user);
                        app.removeItem(user, '_id', article.favorsList);
                        article.isFavor = false;
                    } else {
                        app.removeItem(user, '_id', article.opposesList);
                    }
                    app.toast.success(locale.ARTICLE[article.isOppose ? 'opposed' : 'unopposed']);
                });
            }
        };
        $scope.submit = function () {
            if (checkLogin() && app.validate($scope)) {
                var data = app.union($scope.comment),
                    article = $scope.article;
                restAPI.save({
                    ID: article._id,
                    OP: 'comment'
                }, data, function (data) {
                    var comment = data.data,
                        replyToComment = $scope.comment.replyToComment;
                    article.commentsList.unshift(comment);
                    article.comments += 1;
                    article.updateTime = Date.now();
                    if (replyToComment) {
                        app.some(article.commentsList, function (x, i, list) {
                            if (replyToComment === x._id) {
                                x.commentsList.push(comment._id);
                                return true;
                            }
                        });
                    }
                    commentCache.put(comment._id, comment);
                    initReply();
                });
            }
        };
        $scope.$on('genPagination', function (event, p, s) {
            event.stopPropagation();
            var params = {
                ID: ID,
                OP: 'comment',
                p: p,
                s: myConf.pageSize(s, 'comment', 10)
            };
            app.promiseGet(params, restAPI, app.param(params), listCache).then(function (data) {
                var pagination = data.pagination || {},
                    commentsList = data.data;
                pagination.pageSize = myConf.pageSize(pagination.pageSize, 'comment');
                $scope.pagination = pagination;
                app.each(commentsList, function (x) {
                    checkArticleIs(x);
                    commentCache.put(x._id, x);
                });
                $scope.article.commentsList = commentsList;
                app.anchorScroll.toView('#comments', true);
            });
        });

        mdEditor().run();
        app.promiseGet({
            ID: ID
        }, restAPI, ID, app.cache.article).then(function (data) {
            var pagination = data.pagination || {},
                article = data.data;
            pagination.pageSize = myConf.pageSize(pagination.pageSize, 'comments');
            checkArticleIs(article);
            app.each(article.commentsList, function (x) {
                commentCache.put(x._id, x);
            });
            global.title2 = article.title;
            $scope.pagination = pagination;
            $scope.article = article;
            initReply();

            app.promiseGet({
                ID: article.author._id,
                OP: 'article'
            }, app.restAPI.user, article.author._id, listCache).then(function (data) {
                var user = data.user,
                    author = $scope.article.author;
                app.checkFollow(user);
                app.union(author, user);
                author.articlesList = data.data;
            });
        });
        getList('hots').then(function (data) {
            $scope.hotArticles = data.data.slice(0, 10);
        });
    }
]);
