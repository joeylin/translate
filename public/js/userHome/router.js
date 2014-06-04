'use strict';
/*global angular, jsGenVersion*/

angular.module('jsGen.router', ['ngRoute']).
constant('app', {
    version: Date.now()
}).provider('getFile', ['app',
    function(app) {
        this.html = function(fileName) {
            return '/public/tpl/userHome/' + fileName + '?v=' + app.version;
        };
        this.$get = function() {
            return {
                html: this.html
            };
        };
    }
]).config(['$routeProvider', '$locationProvider', 'getFileProvider',
    function($routeProvider, $locationProvider, getFileProvider) {
        var news = {
            templateUrl: getFileProvider.html('news.html'),
            controller: 'newsCtrl',
            path: 'news'
        };
        var request = {
            templateUrl: getFileProvider.html('request.html'),
            controller: 'requestCtrl',
            path: 'request'
        };
        var message = {
            templateUrl: getFileProvider.html('message.html'),
            controller: 'messageCtrl',
            path: 'message'
        };
        $routeProvider.
        when('/home', news).
        when('/request', request).
        when('/message', message);
        $locationProvider.html5Mode(true).hashPrefix('!');
    }
]);