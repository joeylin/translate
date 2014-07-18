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

        // manage
        var getPostMember = function() {
            url = '/api/job/postList';
            params.page = 1;
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.postList = data.content;
            });
        };
        $scope.manage = function() {
            getPostMember();
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
                $scope.share.comments = data.comments;
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
        getPostMember();
    }
]);