'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('groupCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        $scope.content = [];
        var url;
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var params = {
            page: 1
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.page = $scope.pager.current;
            getApply();
        };
        $scope.prev = function() {
            if ($scope.pager.current <= 1) {
                return false;
            }
            $scope.pager.current -= 1;
            params.page = $scope.pager.current;
            getApply();
        };
        $scope.vm = {};
        $scope.vm.pass = function(item) {
            var url = '/api/group/apply/pass';
            var data = {
                id: item._id
            };
            $http.post(url,data).success(function(data) {
                item.hasDisposed = true;
                item.isPass = true;
            });
        };
        $scope.vm.toggleMsg = function(item) {
            item.showMsgBtn = !item.showMsgBtn;
        };
        $scope.vm.fail = function(item) {
            var url = '/api/group/apply/fail';
            var data = {
                id: item._id,
                msg: item.msg
            };
            if (!item.msg) {
                $('#' + item._id).find('textarea').focus();
            }
            $http.post(url,data).success(function(data) {
                item.hasDisposed = true;
                item.isPass = false;
            });
        };
        var getApply = function() {
            var url ='/api/group/getApply';
            $http.get(url).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
                $scope.total = data.count;
            });
        };
        getApply();
    }
]).controller('userCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope', 
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        
    }
]).controller('countCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        
    }
]).controller('inviteCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        
    }
]).controller('reportCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        
    }
]);