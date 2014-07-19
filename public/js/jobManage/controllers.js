'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('membersCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var params = {
            page: 1,
            perPageItems: 50,
            shareId: app.share._id
        };
        var url;
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.page = $scope.pager.current;
            getPostMember();
        };
        $scope.prev = function() {
            if (!$scope.pager.current) {
                return false;
            }
            $scope.pager.current -= 1;
            params.page = $scope.pager.current;
            getPostMember();
        };
        var getPostMember = function() {
            url = '/api/job/postList';
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.postList = data.content;
                $scope.total = data.total;
            });
        };
        // init
        getPostMember();
    }
]).controller('messageCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var params = {
            page: 1,
            perPageItems: 50,
            shareId: app.share._id
        };
        var getPostMember = function() {
            var url = '/api/share/comments';
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.page = $scope.pager.current;

        };
        $scope.prev = function() {
            if (!$scope.pager.current) {
                return false;
            }
            $scope.pager.current -= 1;
            params.page = $scope.pager.current;
        };

        // init
        getPostMember();
    }
]);