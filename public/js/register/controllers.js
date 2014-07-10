'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('step1Ctrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.professional = true;
        $scope.company = '';
        $scope.school = '';
        $scope.occupation = '';
        $scope.workYear = 0;
        $scope.isFreelance = false;
        $scope.cities = [];

        $scope.showBlankError = false;

        $scope.submit = function() {
            var url = '/api/user/userbasic';
            var data;
            if ($scope.vm.city === '' || $scope.vm.province === '') {
                $scope.showBlankError = true;
                return false;
            }
            if ($scope.professional) {
                if ($scope.occupation === '' || $scope.workYear === '' || (!$scope.isFreelance && $scope.company === '')) {
                    $scope.showBlankError = true;
                    return false;
                }
                data = {
                    company: $scope.company,
                    isFreelance: $scope.isFreelance,
                    school: $scope.school,
                    occupation: $scope.occupation,
                    workYear: $scope.workYear,
                    professional: $scope.professional,
                    location: $scope.vm.city.name
                };
                $http.post(url, data).success(function(data) {
                    $location.path('/register/step2');
                    app.user.registerStage = 2;
                });
            } else {
                if ($scope.school === '' || $scope.vm.schoolDateStart === '' || $scope.vm.schoolDateEnd === '') {
                    $scope.showBlankError = true;
                    return false;
                }
                data = {
                    locatioin: $scope.vm.city.name,
                    school: $scope.school,
                    professional: $scope.professional,
                    occupation: $scope.occupation,
                    schoolStart: $scope.vm.schoolDateStart,
                    schoolEnd: $scope.vm.schoolDateEnd
                };
                $http.post(url, data).success(function(data) {
                    $location.path('/register/step2');
                    app.user.registerStage = 2;
                });
            }
        };

        $scope.vm = {};
        $scope.vm.province = '';
        $scope.vm.city = '';
        $scope.vm.schoolDateStart = '';
        $scope.vm.schoolDateEnd = '';

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