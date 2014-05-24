'use strict';
/*global angular, jsGenVersion*/

angular.module('jsGen.router', ['ngRoute']).
constant('app', {
    version: Date.now()
}).provider('getFile', ['app',
    function(app) {
        this.html = function(fileName) {
            return '/public/tpl/search/' + fileName + '?v=' + app.version;
        };
        this.$get = function() {
            return {
                html: this.html
            };
        };
    }
]).config(['$routeProvider', '$locationProvider', 'getFileProvider',
    function($routeProvider, $locationProvider, getFileProvider) {
        var all = {
            templateUrl: getFileProvider.html('all.html'),
            controller: 'allCtrl',
            path: 'all'
        };
        var people = {
            templateUrl: getFileProvider.html('people.html'),
            controller: 'peopleCtrl',
            path: 'people'
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
        var share = {
            templateUrl: getFileProvider.html('share.html'),
            controller: 'shareCtrl',
            path: 'share'
        };
        $routeProvider.
        when('/search/all', all).
        when('/search/people', people).
        when('/search/job', job).
        when('/search/company', company).
        when('/search/share', share).
        otherwise({
            redirectTo: '/search/all'
        });
        $locationProvider.html5Mode(true).hashPrefix('!');
    }
]);