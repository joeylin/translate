'use strict';
/*global angular, jsGenVersion*/

angular.module('jsGen.router', ['ngRoute']).
constant('app', {
    version: Date.now()
}).provider('getFile', ['app',
    function(app) {
        this.html = function(fileName) {
            return '/public/tpl/jobManage/' + fileName + '?v=' + app.version;
        };
        this.$get = function() {
            return {
                html: this.html
            };
        };
    }
]).config(['$routeProvider', '$locationProvider', 'getFileProvider',
    function($routeProvider, $locationProvider, getFileProvider) {
        var members = {
            templateUrl: getFileProvider.html('members.html'),
            controller: 'membersCtrl',
            path: 'members'
        };
        var message = {
            templateUrl: getFileProvider.html('message.html'),
            controller: 'messageCtrl',
            path: 'message'
        };

        $routeProvider.
        when('/view/:id/message', message).
        when('/view/:id/members', members);
        $locationProvider.html5Mode(true).hashPrefix('!');
    }
]);