'use strict';
/*global angular, jsGenVersion*/

angular.module('jsGen.router', ['ngRoute']).
constant('app', {
    version: Date.now()
}).provider('getFile', ['app',
    function(app) {
        this.html = function(fileName) {
            return '/public/tpl/' + fileName + '?v=' + app.version;
        };
        this.md = function(fileName) {
            return '/public/md/' + fileName + '?v=' + app.version;
        };
        this.$get = function() {
            return {
                html: this.html,
                md: this.md
            };
        };
    }
]).config(['$routeProvider', '$locationProvider', 'getFileProvider',
    function($routeProvider, $locationProvider, getFileProvider) {
        var index = {
            templateUrl: getFileProvider.html('index.html'),
            controller: 'indexCtrl'
        },
            // custom
            doc = {
                templateUrl: getFileProvider.html('index.html'),
                controller: 'docCtrl'
            },
            docHome = {
                templateUrl: getFileProvider.html('doc-home.html'),
                controller: 'docHomeCtrl'
            },
            chapter = {
                templateUrl: getFileProvider.html('chapter.html'),
                controller: 'chapterCtrl'
            },
            editChapter = {
                templateUrl: getFileProvider.html('editChapter.html'),
                controller: 'editChapterCtrl'
            },
            addChapter = {
                templateUrl: getFileProvider.html('editChapter.html'),
                controller: 'addChapterCtrl'
            };
        $routeProvider.
        when('/doc/:doc', docHome).
        when('/doc/:doc/:chapter', chapter).
        when('/doc/:doc/addChapter', addChapter).
        when('/doc/:doc/:chapter/editChapter', editChapter).
        when('/', index).
        otherwise({
            redirectTo: '/doc/:doc'
        });
        $locationProvider.html5Mode(true).hashPrefix('!');
    }
]);