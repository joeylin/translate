'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('settingsListCtrl', ['app', '$scope', '$routeParams', 'getToc', 'getChapter', '$http',
    function(app, $scope, $routeParams, getToc, getChapter, $http) {
    // var doc = $routeParams.doc;
    // var chapter = $routeParams.chapter;
    // var update = function(cb) {
    //     getChapter(doc, chapter).then(function(data) {
    //         data.sections.map(function(value, key) {
    //             value.saveTitle = 'save';
    //             value.newTrans = value.md;
    //         });
    //         $scope.doc.chapter = data;
    //         if (typeof cb === 'function') {
    //             cb();
    //         }
    //     });
    // };
    // update();
    }
]).controller('userCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        
    }
]).controller('profileCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {
    // $scope.doc = app.tocCtrl;
    // $scope.current = $scope.doc.chapter;
    // var name = $scope.doc.docName;
    // $scope.setCurrent = function(index) {
    //     $scope.current = $scope.doc.toc[index].name;
    // };
    // $scope.delChapter = function(index) {
    //     var chapter = $scope.doc.toc[index];
    //     var url = '/api/edit/doc/' + name + '/delChapter';
    //     var data = {};
    //     $http.post(url, data).success(function(err) {
    //         $scope.doc.toc.splice(index, 1);
    //     });
    // };
    // $rootScope.$on('tocChange.ts', function(oldValue, newValue) {
    //     // newValue = {name:'xxx',id:'xxx'};
    //     var index;
    //     $scope.doc.toc.map(function(value, key) {
    //         if (value.name === oldValue) {
    //             index = key;
    //             return;
    //         }
    //     });
    //     $scope.doc.toc.splice(index, 1, newValue);
    // });
    // $rootScope.$on('tocAdd.ts', function(newValue) {
    //     $scope.doc.toc.push(newValue);
    // });
    // $rootScope.$on('autoRedirect.ts', function() {
    //     // waiting to do
    //     app.location();
    // });
    }
]).controller('docCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {
    // var chapter = $routeParams.chapter;
    // var doc = $routeParams.doc;
    // var url = '/api/chapter/' + doc + '/' + chapter + '/md';
    // $http.get(url).success(function(err, data) {
    //     $scope.chapter = {
    //         name: data.chapter.name,
    //         content: data.chapter.content
    //     };
    // });
    // $scope.save = function() {
    //     var url = '';
    //     var data = {};
    //     $http.post(url, data).success(function(err, data) {
    //         $rootScope.$emit('tocChange.ts', $scope.chapter);
    //     });
    // };
    // $scope.isPreview = false;
    // $scope.preview = function() {
    //     $scope.isPreview = true;
    // };
    // $scope.edit = function() {
    //     $scope.isPreview = false;
    // };
    }
]).controller('loginCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {
    // $scope.doc = app.tocCtrl;
    // $scope.current = $scope.doc.chapter;
    // var name = $scope.doc.docName;
    // $scope.setCurrent = function(index) {
    //     $scope.current = $scope.doc.toc[index].name;
    // };
    // $scope.delChapter = function(index) {
    //     var chapter = $scope.doc.toc[index];
    //     var url = '/api/edit/doc/' + name + '/delChapter';
    //     var data = {};
    //     $http.post(url, data).success(function(err) {
    //         $scope.doc.toc.splice(index, 1);
    //     });
    // };
    // $rootScope.on('tocChange.ts', function() {

    // });
    }
]);