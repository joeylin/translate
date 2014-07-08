'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('userCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.professional = 'yes';
        $scope.company = '';
        $scope.school = '';
        $scope.occupation = '';
        $scope.workYear = 0;
        $scope.skills = '';
        $scope.industry = '';
        $scope.isFreelance = false;
        $scope.cities = [];

        $scope.showBlankError = false;

        $scope.submit = function() {
            var url;
            var data;
            if ($scope.vm.city === '' || $scope.vm.province === '') {
                $scope.showBlankError = true;
                return false;
            }
            if ($scope.professional === 'yes') {
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
                    skills: $scope.skills,
                    city: $scope.vm.city
                };
                $http.post(url, data).success(function(data) {
                    window.location.href = '/profile/' + data.id;
                });
            } else {
                if ($scope.school === '' || $scope.industry === '' || $scope.vm.schoolDateStart === '' || $scope.vm.schoolDateEnd === '') {
                    $scope.showBlankError = true;
                    return false;
                }
                data = {
                    city: $scope.vm.city,
                    school: $scope.school,
                    occupation: $scope.industry,
                    schoolStart: $scope.vm.schoolDateStart,
                    schoolEnd: $scope.vm.schoolDateEnd
                };
                $http.post(url, data).success(function(data) {
                    window.location.href = '/profile/' + data.id;
                });
            }
        };

        $scope.vm = {};
        $scope.vm.province = '';
        $scope.vm.city = '';
        $scope.vm.schoolDateStart = '';
        $scope.vm.vm.schoolDateEnd = '';

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
]);