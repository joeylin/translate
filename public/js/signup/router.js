'use strict';
/*global angular, jsGenVersion*/

angular.module('jsGen.router', ['ngRoute']).
constant('app', {
    version: Date.now()
}).provider('getFile', ['app',
    function(app) {
        this.html = function(fileName) {
            return '/public/tpl/signup/' + fileName + '?v=' + app.version;
        };
        this.$get = function() {
            return {
                html: this.html
            };
        };
    }
]).config(['$routeProvider', '$locationProvider', 'getFileProvider',
    function($routeProvider, $locationProvider, getFileProvider) {
        var user = {
            templateUrl: getFileProvider.html('user.html'),
            controller: 'userCtrl',
            path: 'user'
        };
        var company = {
            templateUrl: getFileProvider.html('company.html'),
            controller: 'companyCtrl',
            path: 'company'
        };
        var userBasic = {
            templateUrl: getFileProvider.html('userBasic.html'),
            controller: 'userBasicCtrl',
            path: 'userBasic'
        };
        var companyBasic = {
            templateUrl: getFileProvider.html('companyBasic.html'),
            controller: 'companyBasicCtrl',
            path: 'companyBasic'
        };
        var validate = {
            templateUrl: getFileProvider.html('validate.html'),
            controller: 'validateCtrl',
            path: 'validate'
        };
        var userFinish = {
            templateUrl: getFileProvider.html('userFinish.html'),
            controller: 'userFinishCtrl',
            path: 'userFinish'
        };
        var companyFinish = {
            templateUrl: getFileProvider.html('companyFinish.html'),
            controller: 'companyFinishCtrl',
            path: 'companyFinish'
        };
        $routeProvider.
        when('/signup', user).
        when('/signup/company', company).
        when('/signup/validate', validate).
        when('/signup/user/finish', userFinish).
        when('/signup/company/finish', companyFinish).
        when('/signup/user/basic', userBasic).
        when('/signup/company/basic', companyBasic);
        $locationProvider.html5Mode(true).hashPrefix('!');
    }
]);