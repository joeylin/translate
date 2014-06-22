'use strict';
/*global angular, jsGenVersion*/

angular.module('jsGen.router', ['ngRoute']).
constant('app', {
    version: Date.now()
}).provider('getFile', ['app',
    function(app) {
        this.html = function(fileName) {
            return '/public/tpl/groupHome/' + fileName + '?v=' + app.version;
        };
        this.$get = function() {
            return {
                html: this.html
            };
        };
    }
]).config(['$routeProvider', '$locationProvider', 'getFileProvider',
    function($routeProvider, $locationProvider, getFileProvider) {
        var home = {
            templateUrl: getFileProvider.html('home.html'),
            controller: 'homeCtrl',
            path: 'home'
        };
        var search = {
            templateUrl: getFileProvider.html('search.html'),
            controller: 'searchCtrl',
            path: 'search'
        };
        $routeProvider.
        when('/group', home).
        when('/group/home', home).
        when('/group/search', search);
        $locationProvider.html5Mode(true).hashPrefix('!');
    }
]);