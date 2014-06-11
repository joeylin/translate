'use strict';
/*global angular, jsGenVersion*/

angular.module('jsGen.router', ['ngRoute']).
constant('app', {
    version: Date.now()
}).provider('getFile', ['app',
    function(app) {
        this.html = function(fileName) {
            return '/public/tpl/companyHome/' + fileName + '?v=' + app.version;
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
        var myPost = {
            templateUrl: getFileProvider.html('myPost.html'),
            controller: 'myPostCtrl',
            path: 'myPost'
        };
        var myJob = {
            templateUrl: getFileProvider.html('myJob.html'),
            controller: 'myJobCtrl',
            path: 'myJob'
        };
        var jobManage = {
            templateUrl: getFileProvider.html('jobManage.html'),
            controller: 'jobManageCtrl',
            path: 'jobManage'
        };
        var myShare = {
            templateUrl: getFileProvider.html('myShare.html'),
            controller: 'myShareCtrl',
            path: 'myShare'
        };
        var newPost = {
            templateUrl: getFileProvider.html('newPost.html'),
            controller: 'newPostCtrl',
            path: 'newPost'
        };
        var newJob = {
            templateUrl: getFileProvider.html('newJob.html'),
            controller: 'newJobCtrl',
            path: 'newJob'
        };
        $routeProvider.
        when('/home', news).
        when('/myPost', myPost).
        when('/myJob', myJob).
        when('/myJob/manage', jobManage).
        when('/myShare', myShare).
        when('/posts/new', newPost).
        when('/jobs/new', newJob);
        $locationProvider.html5Mode(true).hashPrefix('!');
    }
]);