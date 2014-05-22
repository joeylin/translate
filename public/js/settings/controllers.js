'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('settingsListCtrl', ['app', '$scope', '$routeParams', 'getToc', 'getChapter', '$http',
    function(app, $scope, $routeParams, getToc, getChapter, $http) {
    }
]).controller('userCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        
    }
]).controller('userBasicCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        var user = app.getUser();
        $scope.display_name = user.display_name;
        $scope.email = user.email;
        $scope.des = user.des;

        $scope.isError = false;
        $scope.errorMsg = '';

        // btn
        $scope.saveBtn = 'save';
        $scope.save = function() {
            var url = '/api/user/edit/basic';
            var data = {
                display_name: $scope.display_name,
                email: $scope.email,
                des: $scope.des
            };
            if ($scope.display_name === '' ||  $scope.email === '' ) {
                $scope.isError = true;
                $scope.errorMsg = 'cant be blank !';
            } else {
                $http.post(url,data).success(function(data) {
                    $scope.saveBtn = 'isSaved';
                    app.updateUser(data.user);
                });
            }
        };
        $scope.change = function() {
            $scope.saveBtn = 'save';
            $scope.isError = false;
        };
    }
]).controller('userPasswordCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        $scope.originPassword = '';
        $scope.newPassword = '';
        $scope.repeatPassword = '';

        $scope.isError = false;
        $scope.errorMsg = '';

        $scope.saveBtn = 'save';
        $scope.save = function() {
            var url = '/api/user/edit/password';
            var data = {
                originPassword: $scope.originPassword,
                newPassword: $scope.newPassword,
            };
            if ($scope.newPassword !== $scope.repeatPassword) {
                $scope.isError = true;
                $scope.errorMsg = 'cant be blank !';
            } else {
                $http.post(url,data).success(function(data) {
                    $scope.saveBtn = 'isSaved';
                    app.updateUser(data.user);
                });
            }
        };
        $scope.change = function() {
            $scope.saveBtn = 'save';
            $scope.isError = false;
        };
    }
]).controller('userImageCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        var user = app.getUser();
        $scope.avatar = user.avatar;

        // btn
        $scope.saveBtn = 'save';
        $scope.save = function() {
            var url = '/api/user/edit/avatar';
            var data = {
                avatar: $scope.avatar
            };
            $http.post(url,data).success(function(data) {
                $scope.saveBtn = 'isSaved';
                app.updateUser(data.user);
            });
        };
        $scope.change = function() {
            $scope.saveBtn = 'save';
            $scope.isError = false;
        };

    }
]).controller('profileCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {

    }
]).controller('docCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {

    }
]).controller('loginCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope', '$location',
    function(app, $scope, $routeParams, $http, $rootScope, $location) {
        app.clearUser();
        $scope.user = {
            username: '',
            password: ''
        };
        $scope.isError = false;
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
                $scope.$destroy();
                $location.path('/setings/user');
            }, function(data) {
                $scope.isError = true;
            });
        };
        $scope.enter = function(e) {
            var key = e.keyCode || e.which;
            if (key === 13) {
                $scope.submit();
            }
        };
        $scope.change = function() {
            $scope.isError = false;
        };
    }
]);