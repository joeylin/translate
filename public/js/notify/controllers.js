'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('requestCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.requests = [];
        var checkUrl = '/api/connect/check';
        var dispose = function() {
            $rootScope.current.request -= 1;
        };
        $scope.vm = {};
        $scope.vm.accept = function(request) {
            var params = {
                value: true,
                requestId: request._id
            };
            $http.post(checkUrl, params).success(function(data) {
                request.hasDisposed = true;
                dispose();
            });
        };
        $scope.vm.reject = function(request) {
            var params = {
                value: false,
                requestId: request._id
            };
            $http.post(checkUrl, params).success(function(data) {
                request.hasDisposed = true;
                dispose();
            });
        };
        var url = '/api/notify/request';
        $http.get(url).success(function(data) {
            $scope.requests = data.requests;
        }).error(function(err) {
            console.log();
        });
    }
]).controller('messageCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {

    }
]);