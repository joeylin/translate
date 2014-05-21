'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('indexCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {

    }
]).controller('allCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
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
                $http.post(url, data).success(function(data) {
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
]).controller('peopleCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
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
                $http.post(url, data).success(function(data) {
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
]).controller('jobCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
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
            $http.post(url, data).success(function(data) {
                $scope.saveBtn = 'isSaved';
                app.updateUser(data.user);
            });
        };
        $scope.change = function() {
            $scope.saveBtn = 'save';
            $scope.isError = false;
        };

    }
]).controller('companyCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
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
            $http.post(url, data).success(function(data) {
                $scope.saveBtn = 'isSaved';
                app.updateUser(data.user);
            });
        };
        $scope.change = function() {
            $scope.saveBtn = 'save';
            $scope.isError = false;
        };

    }
]).controller('shareCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {

    }
]);