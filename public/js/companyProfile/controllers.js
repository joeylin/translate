'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('indexCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        $scope.itemList = [];
        var params = {
            page: 1,
            id: window.userId
        };
        var getTrends = function() {
            var url = '/api/user/companyActive';
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.itemList = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.page = $scope.pager.current;
            getTrends();
        };
        $scope.prev = function() {
            if (!$scope.pager.current) {
                return false;
            }
            $scope.pager.current -= 1;
            params.page = $scope.pager.current;
            getTrends();
        };

        // init
        getTrends();
    }
]);