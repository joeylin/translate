'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('chapterCtrl', ['app', '$scope', '$routeParams', 'getToc', 'getChapter',
    function(app, $scope, $routeParams, getToc, getChapter) {
        var doc = $routeParams.doc;
        var chapter = $routeParams.chapter;
        $scope.doc = {
            name: $routeParams.doc,
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
        $scope.doc.getOrigin = function() {
            $scope.status.read = false;
            $scope.status.translate = false;
            $scope.status.orgin = true;
        };
        $scope.doc.getTranslate = function() {
            $scope.status.read = true;
            $scope.status.translate = false;
            $scope.status.orgin = false;
        };
        getChapter(doc, chapter).then(function(data) {
            $scope.doc.chapter = data;
            console.log(data);
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
            $scope.login = 'Wait...';
            var user = $scope.user;
            var data = {
                username: user.username,
                password: user.password
            };

            data.logtime = Date.now() - app.timeOffset;
            app.restAPI.user.save({
                ID: 'login'
            }, data, function(data) {
                app.loginUser(data.user);
                $('#menuLogin').removeClass('open');
                $scope.$destroy();
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
            data.password = user.password;
            app.restAPI.user.save({
                ID: 'register'
            }, data, function(data) {
                app.loginUser(data.user);
                $scope.signup = 'Sign Up';
                $('#menuLogin').removeClass('open');
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