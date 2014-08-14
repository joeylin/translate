'use strict';
/*global angular, jsGenVersion*/

angular.module('jsGen.router', ['ngRoute']).
constant('app', {
    version: Date.now()
}).provider('getFile', ['app',
    function(app) {
        this.html = function(fileName) {
            return '/public/tpl/admin/' + fileName + '?v=' + app.version;
        };
        this.$get = function() {
            return {
                html: this.html
            };
        };
    }
]).config(['$routeProvider', '$locationProvider', 'getFileProvider',
    function($routeProvider, $locationProvider, getFileProvider) {
        var group = {
            templateUrl: getFileProvider.html('group.html'),
            controller: 'groupCtrl',
            path: 'group'
        };
        var user = {
            templateUrl: getFileProvider.html('user.html'),
            controller: 'userCtrl',
            path: 'user'
        };
        var count = {
            templateUrl: getFileProvider.html('count.html'),
            controller: 'countCtrl',
            path: 'count'
        };
        var invite = {
            templateUrl: getFileProvider.html('invite.html'),
            controller: 'inviteCtrl',
            path: 'invite'
        };
        var report = {
            templateUrl: getFileProvider.html('report.html'),
            controller: 'reportCtrl',
            path: 'report'
        };

        $routeProvider.
        when('/admin/count', count).
        when('/admin/group', group).
        when('/admin/invite', invite).
        when('/admin/report', report).
        when('/admin/user', user);
        $locationProvider.html5Mode(true).hashPrefix('!');
    }
]);