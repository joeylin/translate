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
        var groupTrends = {
            templateUrl: getFileProvider.html('groupTrends.html'),
            controller: 'groupTrendsCtrl',
            path: 'groupTrends'
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
            controller: 'newsCtrl',
            path: 'myShare'
        };
        var myCollect = {
            templateUrl: getFileProvider.html('myCollect.html'),
            controller: 'newsCtrl',
            path: 'myCollect'
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
        var mySending = {
            templateUrl: getFileProvider.html('mySending.html'),
            controller: 'mySendingCtrl',
            path: 'mySending'
        };
        var myGroup = {
            templateUrl: getFileProvider.html('myGroup.html'),
            controller: 'myGroupCtrl',
            path: 'myGroup'
        };
        var connect = {
            templateUrl: getFileProvider.html('request.html'),
            controller: 'requestCtrl',
            path: 'connect'
        };
        var reply = {
            templateUrl: getFileProvider.html('request.html'),
            controller: 'requestCtrl',
            path: 'reply'
        };
        var comment = {
            templateUrl: getFileProvider.html('commentMe.html'),
            controller: 'requestCtrl',
            path: 'comment'
        };
        var group = {
            templateUrl: getFileProvider.html('request.html'),
            controller: 'requestCtrl',
            path: 'group'
        };
        var at = {
            templateUrl: getFileProvider.html('atMe.html'),
            controller: 'requestCtrl',
            path: 'at'
        };
        var notice = {
            templateUrl: getFileProvider.html('notice.html'),
            controller: 'requestCtrl',
            path: 'notice'
        };
        var newJob = {
            templateUrl: getFileProvider.html('newJob.html'),
            controller: 'newJobCtrl',
            path: 'newJob'
        };
        var editJob = {
            templateUrl: getFileProvider.html('newJob.html'),
            controller: 'newJobCtrl',
            path: 'editJob'
        };

        $routeProvider.
        when('/home', news).
        when('/people', people).
        when('/share', share).
        when('/job', job).
        when('/company', company).
        when('/groupTrends', groupTrends).
        when('/myPeople', myPeople).
        when('/myGroup', myGroup).
        when('/myShare', myShare).
        when('/myCollect', myCollect).
        when('/myJob', myJob).
        when('/jobs/new', newJob).
        when('/jobs/:id/edit', editJob).
        when('/myCompany', myCompany).
        when('/mySending', mySending).
        when('/request/connect', connect).
        when('/request/reply', reply).
        when('/request/comment', comment).
        when('/request/group', group).
        when('/request/at', at).
        when('/request/notice', notice).
        when('/message', message);
        $locationProvider.html5Mode(true).hashPrefix('!');
    }
]);