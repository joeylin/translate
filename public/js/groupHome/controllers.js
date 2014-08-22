'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate', 'ui.bootstrap.pagination']).
controller('homeCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.keyword = '';
        $scope.isSearch = false;
        $scope.content = app.popular || [];
        var url = '/api/group/homeSearch';
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var params = {
            page: 1
        };
        $scope.submit = function() {
            var params = {
                page: 1,
                keyword: $scope.keyword
            };
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.isSearch = true;
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.enter = function(e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13) {
                $scope.submit();
            }
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.page = $scope.pager.current;
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.prev = function() {
            if ($scope.pager.current <= 1) {
                return false;
            }
            $scope.pager.current -= 1;
            params.page = $scope.pager.current;
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
    }
]).controller('CreateCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.name = '';
        $scope.industry = '';
        $scope.reason = '';
        $scope.error = false;
        $scope.create = function() {
            // if ($scope.name === '' || $scope.industry === '') {
            //     $scope.error = true;
            //     return false;
            // }
            // if (app.author.groupCount > 4) {
            //     return false;
            // }
            // var url = '/api/group/create';
            // var data = {
            //     name: $scope.name,
            //     industry: $scope.industry,
            //     reason: $scope.reason
            // };
            // $http.post(url, data).success(function(data) {
            //     $.magnificPopup.close();
            // });

            if ($scope.name === '' || $scope.industry === '' || $scope.reason === '') {
                $scope.error = true;
                return false;
            }
            var url = '/api/group/apply';
            var data = {
                name: $scope.name,
                industry: $scope.industry,
                reason: $scope.reason
            };
            if (app.author.groupCount > 4) {
                return false;
            }
            $http.post(url, data).success(function(data) {
                $.magnificPopup.close();
            });
        };
        $scope.change = function() {
            if ($scope.name !== '' && $scope.industry !== '' && $scope.reason !== '') {
                $scope.error = false;
            }
        };
    }
]);