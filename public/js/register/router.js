'use strict';
/*global angular, jsGenVersion*/

angular.module('jsGen.router', ['ngRoute']).
constant('app', {
    version: Date.now()
}).provider('getFile', ['app',
    function(app) {
        this.html = function(fileName) {
            return '/public/tpl/register/' + fileName + '?v=' + app.version;
        };
        this.$get = function() {
            return {
                html: this.html
            };
        };
    }
]).config(['$routeProvider', '$locationProvider', 'getFileProvider',
    function($routeProvider, $locationProvider, getFileProvider) {
        var step1 = {
            templateUrl: getFileProvider.html('step1.html'),
            controller: 'step1Ctrl',
            path: 'step1'
        };
        var step2 = {
            templateUrl: getFileProvider.html('step2.html'),
            controller: 'step2Ctrl',
            path: 'step2'
        };
        var step3 = {
            templateUrl: getFileProvider.html('step3.html'),
            controller: 'step3Ctrl',
            path: 'step3'
        };

        $routeProvider.
        when('/register', step1).
        when('/register/step1', step1).
        when('/register/step2', step2).
        when('/register/step3', step3);
        $locationProvider.html5Mode(true).hashPrefix('!');
    }
]);