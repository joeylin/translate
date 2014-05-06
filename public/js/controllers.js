'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('chapterCtrl', ['app', '$scope', '$routeParams', 'getToc', 'getChapter',
    function(app, $scope, $routeParams, getToc, getChapter) {
        var doc = $routeParams.doc;
        var chapter = $routeParams.chapter;
        $scope.doc = {
            name: $routeParams.doc,
            file: app.getFile.html('chapter.html'),
            translate: false
        };
        $scope.status = {
            read: true,
            translate: false,
            orgin: false
        };
        $scope.doc.makeTranslate = function() {
            if (!app.auth()) {
                return false;
            }
            $scope.doc.translate = !$scope.doc.translate;
            if ($scope.doc.translate) {
                $scope.status.read = false;
                $scope.status.translate = true;
            } else {
                $scope.status.read = true;
                $scope.status.translate = false;
            }
        };
        getChapter(doc, chapter).then(function(data) {
            $scope.doc.chapter = data;
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
        $scope.user = {
            username: '',
            password: ''
        };

        $scope.submit = function() {
            var data = app.union($scope.user);
            $scope.login = 'Wait...';
            data.logtime = Date.now() - app.timeOffset;
            data.password = app.CryptoJS.SHA256(data.password).toString();
            data.password = app.CryptoJS.HmacSHA256(data.password, 'jsGen').toString();
            data.password = app.CryptoJS.HmacSHA256(data.password, data.username + ':' + data.logtime).toString();

            app.restAPI.user.save({
                ID: 'login'
            }, data, function(data) {
                app.rootScope.global.user = data.user;
                $scope.$broadcast('toggle');
                $scope.login = 'Login';
            }, function(data) {
                $scope.$emit('shake');
                $scope.login = 'Login';
            });
        };
    }
]).controller('userRegisterCtrl', ['app', '$scope',
    function(app, $scope) {
        var global = app.rootScope.global;
        app.clearUser();
        global.title2 = app.locale.USER.register;
        $scope.user = {
            username: '',
            email: '',
            password: '',
            password2: ''
        };
        $scope.signup = 'Sign Up';
        $scope.submit = function() {
            var user = $scope.user;
            $scope.signup = 'Wait...';

            var data = {
                username: user.username,
                email: user.email
            };
            data.password = app.CryptoJS.SHA256(user.password).toString();
            data.password = app.CryptoJS.HmacSHA256(data.password, 'jsGen').toString();

            app.restAPI.user.save({
                ID: 'register'
            }, data, function(data) {
                app.rootScope.global.user = data.user;
                $scope.$emit('toggle');
                $scope.signup = 'Sign Up';
            }, function() {
                $scope.$emit('shake');
                $scope.signup = 'Sign Up';
            });

        };
    }
]).controller('settingsCtrl', ['app', '$scope',
    function(app, $scope) {
        $scope.logout = function() {
            app.restAPI.user.get({
                ID: 'logout'
            }, function() {
                app.clearUser();
            });
        };

    }
]);