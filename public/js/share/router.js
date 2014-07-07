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
        var jobManage = {
            templateUrl: getFileProvider.html('jobManage.html'),
            controller: 'jobManageCtrl',
            path: 'jobManage'
        };
        var view = {
            templateUrl: getFileProvider.html('view.html'),
            controller: 'viewCtrl',
            path: 'view'
        };

        $routeProvider.
        when('/view/:id/manage', jobManage);
        $locationProvider.html5Mode(true).hashPrefix('!');
    }
]);