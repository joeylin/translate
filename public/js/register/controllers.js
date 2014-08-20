'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('step1Ctrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.professional = true;
        $scope.company = '';
        $scope.school = '';
        $scope.occupation = '';
        $scope.status = '';
        $scope.cities = [];

        $scope.showBlankError = false;

        $scope.submit = function() {
            var url = '/api/user/userbasic';
            var data;
            if (!$scope.vm.city || !$scope.vm.province || !$scope.status) {
                $scope.showBlankError = true;
                return false;
            }
            if ($scope.status === 'c' && !$scope.school) {
                $scope.showBlankError = true;
                return false;
            }
            if ($scope.status === 'a' && !$scope.company) {
                $scope.showBlankError = true;
                return false;
            }
            data = {
                company: $scope.company,
                school: $scope.school,
                occupation: $scope.occupation,
                status: $scope.status,
                location: $scope.vm.city.name
            };
            $http.post(url, data).success(function(data) {
                window.location.href = '/register/step2';
                app.user.registerStage = 2;
            });
        };

        $scope.vm = {};
        $scope.vm.province = '';
        $scope.vm.city = '';

        $scope.changePro = function() {
            var url = '/api/json/city';
            var params = {
                value: $scope.vm.province
            };
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.cities = data.content;
            });
        };
        function getProvinces() {
            var url = '/api/json/province';
            $http.get(url).success(function(data) {
                $scope.provinces = data.content;
            });
        }
        getProvinces();
    }
]).controller('step2Ctrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        if (app.user.registerStage === 1) {
            return $location.path('/register/step1');
        }
        $scope.email = app.user.email;
    }
]).controller('step3Ctrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {

    }
]);