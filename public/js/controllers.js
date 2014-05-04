'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('docCtrl', ['app', '$scope', '$routeParams', 'getToc', 'getChapter',
    function(app, $scope, $routeParams, getToc, getChapter) {
        var doc = $routeParams.doc;
        var chapter = $routeParams.chapter;
        $scope.doc = {
            name: $routeParams.doc,
            file: app.getFile.html('chapter.html'),
            translate: false
        };
        $scope.doc.makeTranslate = function() {
            if (!app.auth()) {
                return false;
            }
            $scope.doc.translate = !$scope.doc.translate;
        };
        getToc(doc).then(function(data) {
            $scope.doc.version = data.version;
            $scope.doc.toc = data.toc;
        });
        getChapter(doc, chapter).then(function(data) {
            $scope.doc.chapter = data;
        });
    }
]).controller('tocCtrl', ['app', '$scope', '$routeParams', 'getToc', 'getChapter',
    function(app, $scope, $routeParams, getToc, getChapter) {
        var doc = $routeParams.doc;
        setTimeout(function() {
            
        },10);
        $scope.docName = doc;
        getToc(doc).then(function(data) {
            $scope.toc = data.toc;
            console.log($routeParams);
        });
    }
]).controller('docHomeCtrl', ['app', '$scope', '$routeParams', 'getChapter', '$location',
    function(app, $scope, $routeParams, getChapter, $location) {
        var doc = $routeParams.doc;
        var chapter = $routeParams.chapter;
        $scope.doc = {};
        getChapter(doc, chapter).then(function(data) {
            $scope.doc.chapter = data;
        });
    }
]).controller('userLoginCtrl', ['app', '$scope',
    function(app, $scope) {
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

        $scope.submit = function() {
            if (app.validate($scope)) {
                var data = app.union($scope.login);
                data.logtime = Date.now() - app.timeOffset;
                data.logpwd = app.CryptoJS.SHA256(data.logpwd).toString();
                data.logpwd = app.CryptoJS.HmacSHA256(data.logpwd, 'jsGen').toString();
                data.logpwd = app.CryptoJS.HmacSHA256(data.logpwd, data.logname + ':' + data.logtime).toString();

                app.restAPI.user.save({
                    ID: 'login'
                }, data, function(data) {
                    app.rootScope.global.user = data.user;
                    app.checkUser();
                    $scope.$destroy();
                    app.location.path('/home');
                }, function(data) {
                    $scope.reset.type = data.error.name;
                    $scope.reset.title = app.locale.RESET[data.error.name];
                });
            }
        };
        $scope.clearUsername = function() {
            $scope.login.logname = '';
        };
        $scope.clearPassword = function() {
            $scope.login.logpwd = '';
        };
    }
]).controller('userRegisterCtrl', ['app', '$scope',
    function(app, $scope) {
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

        $scope.checkName = function(scope, model) {
            return filter('checkName')(model.$value);
        };
        $scope.checkMin = function(scope, model) {
            return lengthFn(model.$value) >= 5;
        };
        $scope.checkMax = function(scope, model) {
            return lengthFn(model.$value) <= 15;
        };
        $scope.submit = function() {
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
                }, data, function(data) {
                    app.rootScope.global.user = data.data;
                    app.checkUser();
                    $scope.$destroy();
                    app.location.path('/home');
                });
            }
        };
    }
]);