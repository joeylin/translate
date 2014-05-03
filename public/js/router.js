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
            home = {
                templateUrl: getFileProvider.html('user.html'),
                controller: 'homeCtrl'
            },
            admin = {
                templateUrl: getFileProvider.html('admin.html'),
                controller: 'adminCtrl'
            },
            edit = {
                templateUrl: getFileProvider.html('article-editor.html'),
                controller: 'articleEditorCtrl'
            },
            tag = {
                templateUrl: getFileProvider.html('index.html'),
                controller: 'tagCtrl'
            },
            reset = {
                templateUrl: getFileProvider.html('reset.html'),
                controller: 'userResetCtrl'
            },
            user = {
                templateUrl: getFileProvider.html('user.html'),
                controller: 'userCtrl'
            },
            article = {
                templateUrl: getFileProvider.html('article.html'),
                controller: 'articleCtrl'
            },
            collection = {
                templateUrl: getFileProvider.html('collection.html'),
                controller: 'collectionCtrl'
            },
            // custom
            doc = {
                templateUrl: getFileProvider.html('index.html'),
                controller: 'docCtrl'
            },
            docHome = {
                templateUrl: getFileProvider.html('index.html'),
                controller: 'docHomeCtrl'
            },
            chapter = {
                templateUrl: getFileProvider.html('index.html'),
                controller: 'chapterCtrl'
            };
        $routeProvider.
        // when('/hots', index).
        // when('/update', index).
        // when('/latest', index).
        // when('/T:ID', index).
        // when('/tag/:TAG', index).
        // when('/login', login).
        // when('/register', register).
        // when('/reset', reset).
        // when('/home', home).
        // when('/home/:OP', home).
        // when('/admin', admin).
        // when('/admin/:OP', admin).
        // when('/tag', tag).
        // when('/add', edit).
        // when('/A:ID/edit', edit).
        // when('/user/U:ID', user).
        // when('/user/U:ID/:OP', user).
        // when('/U:ID', user).
        // when('/U:ID/:OP', user).
        // when('/A:ID', article).
        // when('/C:ID', collection).
        when('/:doc', docHome).
        when('/:doc/:chapter', doc).
        when('/home', home).
        when('/', home).
        otherwise({
            redirectTo: '/'
        });
        $locationProvider.html5Mode(true).hashPrefix('!');
    }
]);