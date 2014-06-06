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
        var people = {
            templateUrl: getFileProvider.html('people.html'),
            controller: 'peopleCtrl',
            path: 'people'
        };
        var share = {
            templateUrl: getFileProvider.html('share.html'),
            controller: 'shareCtrl',
            path: 'share'
        };
        var job = {
            templateUrl: getFileProvider.html('job.html'),
            controller: 'jobCtrl',
            path: 'job'
        };
        var company = {
            templateUrl: getFileProvider.html('company.html'),
            controller: 'companyCtrl',
            path: 'company'
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
        when('/people', people).
        when('/share', share).
        when('/job', job).
        when('/company', company).
        when('/request', request).
        when('/message', message);
        $locationProvider.html5Mode(true).hashPrefix('!');
    }
]);