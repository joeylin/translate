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

    }
]).controller('docCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {

    }
]).controller('loginCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope', '$location',
    function(app, $scope, $routeParams, $http, $rootScope, $location) {
        app.clearUser();
        $scope.user = {
            username: '',
            password: ''
        };
        $scope.isError = false;
        $scope.submit = function() {
            $scope.login = 'Wait...';
            var user = $scope.user;
            var data = {
                username: user.username,
                password: user.password
            };

            data.logtime = Date.now() - app.timeOffset;
            app.restAPI.user.save({
                ID: 'login'
            }, data, function(data) {
                app.loginUser(data.user);
                $scope.$destroy();
                $location.path('/setings/user');
            }, function(data) {
                $scope.isError = true;
            });
        };
        $scope.enter = function(e) {
            var key = e.keyCode || e.which;
            if (key === 13) {
                $scope.submit();
            }
        };
        $scope.change = function() {
            $scope.isError = false;
        };
    }
]);