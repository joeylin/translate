'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate','ui.bootstrap.pagination']).
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
        var url = '/api/group/home';
        $http.get(url).success(function(data) {
            $scope.top = data.top;
            $scope.like = data.like;
        });
    }
]).controller('sideBarCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.name = '';
        $scope.industry = '';
        $scope.isSuccess = false;
        $scope.create = function() {
            var url = '';
            var data = {
                name: $scope.name,
                industry: $scope.industry,
            };
            $http.post(url,data).success(function() {
                $scope.isSuccess = true;
                app.timeout(function() {
                    $scope.isSuccess = false;
                    $.magnificPopup.close();
                },1000);
            });
        };
    }
]);