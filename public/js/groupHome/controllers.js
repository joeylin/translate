'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate', 'ui.bootstrap.pagination']).
controller('searchCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.keyword = '';
        $scope.content = [];
        var url = '/api/group/search';
        var params = {
            pager: 0,
            keyword: $scope.keyword
        };
        $scope.submit = function() {
            // reset the config before submit
            var params = {
                pager: 0,
                keyword: $scope.keyword
            };
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
]).controller('homeCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        // var url = '/api/group/home';
        // $http.get(url).success(function(data) {
        //     $scope.popular = data.popular;
        //     $scope.newGroup = data.newGroup;
        // });
        $scope.popular = app.popular;
        $scope.newGroup = app.newGroup;
    }
]).controller('CreateCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.name = '';
        $scope.industry = '';
        $scope.error = false;
        $scope.create = function() {
            if ($scope.name === '' || $scope.industry === '') {
                $scope.error = true;
                return false;
            }
            var url = '/api/group/create';
            var data = {
                name: $scope.name,
                industry: $scope.industry,
            };
            $http.post(url, data).success(function(data) {
                $.magnificPopup.close();
                $location.path('/group/' + data.groupId + '/settings');
            });
        };
        $scope.change = function() {
            if ($scope.name !== '' && $scope.industry !== '') {
                $scope.error = false;
            }
        };
    }
]);