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
        var myPeople = {
            templateUrl: getFileProvider.html('myPeople.html'),
            controller: 'myPeopleCtrl',
            path: 'myPeople'
        };
        var myShare = {
            templateUrl: getFileProvider.html('myShare.html'),
            controller: 'myShareCtrl',
            path: 'myShare'
        };
        var myJob = {
            templateUrl: getFileProvider.html('myJob.html'),
            controller: 'myJobCtrl',
            path: 'myJob'
        };
        var myCompany = {
            templateUrl: getFileProvider.html('myCompany.html'),
            controller: 'myCompanyCtrl',
            path: 'myCompany'
        };
        $routeProvider.
        when('/home', news).
        when('/people', people).
        when('/share', share).
        when('/job', job).
        when('/company', company).
        when('/myPeople', myPeople).
        when('/myShare', myShare).
        when('/myJob', myJob).
        when('/myCompany', myCompany).
        when('/request', request).
        when('/message', message);
        $locationProvider.html5Mode(true).hashPrefix('!');
    }
]);