'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('indexCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.vm = {};
        $scope.vm.pager = {};
        $scope.vm.pager.current = 0;
        $scope.vm.pager.hasLast = true;
        $scope.vm.pager.link = function(url, params, cb) {
            $http.get(url, {
                params: params
            }).success(function(data, status) {
                cb(data);
            });
        };
    }
]).controller('allCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {

    }
]).controller('peopleCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        $scope.name = '';
        $scope.keyword = '';
        $scope.content = [];
        var url = '/api/search/people';
        var params = {
            pager: 0,
            name: $scope.name,
            keyword: $scope.keyword
        };
        $scope.submit = function() {
            params.pager = 0;
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.content = data.content;
                $scope.vm.pager.hasLast = data.hasLast;
            });
        };
        $scope.next = function() {
            if (!$scope.vm.pager.hasLast) {
                return false;
            }
            $scope.vm.pager.current += 1;
            params.pager = $scope.vm.pager.current;
            $scope.vm.pager.link(url, params, function(data) {
                $scope.content = data.content;
                $scope.vm.pager.hasLast = data.hasLast;
            });
        };
        $scope.prev = function() {
            if (!$scope.vm.pager.current) {
                return false;
            }
            $scope.vm.pager.current -= 1;
            params.pager = $scope.vm.pager.current;
            $scope.vm.pager.link(url, params, function(data) {
                $scope.content = data.content;
                $scope.vm.pager.hasLast = data.hasLast;
            });
        };

    }
]).controller('jobCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {

    }
]).controller('companyCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {

    }
]).controller('shareCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {

    }
]);