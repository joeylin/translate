'use strict';
/*global angular, jsGenVersion*/

angular.module('jsGen.router', ['ngRoute']).
constant('app', {
    version: Date.now()
}).provider('getFile', ['app',
    function(app) {
        this.html = function(fileName) {
            return '/public/tpl/group/' + fileName + '?v=' + app.version;
        };
        this.$get = function() {
            return {
                html: this.html
            };
        };
    }
]).config(['$routeProvider', '$locationProvider', 'getFileProvider',
    function($routeProvider, $locationProvider, getFileProvider) {
        var topic = {
            templateUrl: getFileProvider.html('topic.html'),
            controller: 'topicCtrl',
            path: 'topic'
        };
        var settings = {
            templateUrl: getFileProvider.html('settings.html'),
            controller: 'settingsCtrl',
            path: 'settings'
        };
        $routeProvider.
        when('/group/:id', topic).
        when('/group/:id/settings', settings);
        $locationProvider.html5Mode(true).hashPrefix('!');
    }
]);