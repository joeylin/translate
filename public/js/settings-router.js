'use strict';
/*global angular, jsGenVersion*/

angular.module('jsGen.router', ['ngRoute']).
constant('app', {
    version: Date.now()
}).provider('getFile', ['app',
    function(app) {
        this.html = function(fileName) {
            return '/public/tpl/' + fileName + '?v=' + app.version;
        };
        this.md = function(fileName) {
            return '/public/md/' + fileName + '?v=' + app.version;
        };
        this.$get = function() {
            return {
                html: this.html,
                md: this.md
            };
        };
    }
]).config(['$routeProvider', '$locationProvider', 'getFileProvider',
    function($routeProvider, $locationProvider, getFileProvider) {
        var index = {
            templateUrl: getFileProvider.html('index.html'),
            controller: 'indexCtrl'
        },
            // custom
            user = {
                templateUrl: getFileProvider.html('settings-user.html'),
                controller: 'userCtrl'
            },
            profile = {
                templateUrl: getFileProvider.html('settings-profile.html'),
                controller: 'profileCtrl'
            },
            doc = {
                templateUrl: getFileProvider.html('settings-doc.html'),
                controller: 'docCtrl'
            },
            login = {
                templateUrl: getFileProvider.html('settings-login.html'),
                controller: 'loginCtrl'
            };
        $routeProvider.
        when('/settings/user', user).
        when('/settings/profile', profile).
        when('/settings/doc', doc).
        when('/settings/login', login).
        when('/', index).
        otherwise({
            redirectTo: '/settings/user'
        });
        $locationProvider.html5Mode(true).hashPrefix('!');
    }
]);