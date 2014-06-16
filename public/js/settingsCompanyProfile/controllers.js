'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('headerCtrl', ['app', '$scope', '$routeParams', 'getToc', 'getChapter', '$http',
    function(app, $scope, $routeParams, getToc, getChapter, $http) {
        $scope.display_name = app.user.display_name || 'add your company name';
        $scope.signature = app.user.signature || 'add your signature';

        $scope.showNameContent = true;
        $scope.showNameEdit = true;
        $scope.showNameInput = false;
        $scope.editName = function() {
            $scope.showNameEdit = false;
            $scope.showNameInput = true;
            $scope.showNameContent = false;
        };
        $scope.enterName = function(e) {
            if (!e) {
                return setName();
            }
            var key = e.keyCode || e.which;
            if (key === 13) {
                setName();
            }
        };

        $scope.showSignContent = true;
        $scope.showSignEdit = true;
        $scope.showSignInput = false;
        $scope.editSign = function() {
            $scope.showSignEdit = false;
            $scope.showSignInput = true;
            $scope.showSignContent = false;
        };
        $scope.enterSign = function(e) {
            if (!e) {
                return setSign();
            }
            var key = e.keyCode || e.which;
            if (key === 13) {
                setSign();
            }
        };

        function setName() {
            var url = '/api/companyProfile/header';
            if ($scope.display_name === '') {
                return false;
            }
            var data = {
                display_name: $scope.display_name,
                signature: $scope.signature
            };
            $http.post(url, data).success(function(data) {
                $scope.showNameContent = true;
                $scope.showNameEdit = true;
                $scope.showNameInput = false;
            });
        }

        function setSign() {
            var url = '/api/companyProfile/header';
            if ($scope.signature === '') {
                return false;
            }
            var data = {
                display_name: $scope.display_name,
                signature: $scope.signature
            };
            $http.post(url, data).success(function(data) {
                $scope.showSignContent = true;
                $scope.showSignEdit = true;
                $scope.showSignInput = false;
            });
        }
    }
]).controller('basicCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        $scope.location = app.user.location || 'add company location';
        $scope.industry = app.user.industry || 'add company industry';
        $scope.scale = app.user.scale || 'add company scale';
        $scope.phase = app.user.phase || 'add company phase';
        $scope.page = app.user.page || 'add company home page';

        $scope.showEditIcon = true;
        $scope.showContent = true;
        $scope.showSettings = false;

        $scope.edit = function() {
            $scope.showEditIcon = false;
            $scope.showContent = false;
            $scope.showSettings = true;

            $scope.inputLocation = $scope.location;
            $scope.inputIndustry = $scope.industry;
            $scope.inputScale = $scope.scale;
            $scope.inputPhase = $scope.phase;
            $scope.inputPage = $scope.page;
        };
        $scope.save = function() {
            $scope.showEditIcon = true;
            $scope.showContent = true;
            $scope.showSettings = false;

            setValue({
                location: $scope.inputLocation,
                industry: $scope.inputIndustry,
                scale: $scope.inputScale,
                phase: $scope.inputPhase,
                page: $scope.inputPage
            });
        };
        $scope.cancel = function() {
            $scope.showEditIcon = true;
            $scope.showContent = true;
            $scope.showSettings = false;
        };

        function setValue(obj) {
            var url = '/api/companyProfile/basic';
            $http.post(url, obj).success(function(data) {
                $scope.location = obj.location;
                $scope.industry = obj.industry;
                $scope.scale = obj.scale;
                $scope.phase = obj.phase;
                $scope.page = obj.page;
            });
        }
    }
]).controller('describeCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {
        $scope.teamDesc = app.profile.teamDesc || '';
        $scope.productDesc = app.profile.productDesc || '';

        $scope.showEditIcon = true;
        $scope.showContent = true;
        $scope.showHome = false;
        $scope.showSettings = false;

        $scope.edit = function() {
            $scope.showEditIcon = false;
            $scope.showContent = false;
            $scope.showHome = false;
            $scope.showSettings = true;

            $scope.inputTeamDesc = $scope.teamDesc;
            $scope.inputProductDesc = $scope.productDesc;
        };
        $scope.save = function() {
            var url = '/api/companyProfile/desc';
            var data = {
                teamDesc: $scope.inputTeamDesc,
                productDesc: $scope.inputProductDesc
            };
            $http.post(url, data).success(function(data) {
                $scope.showEditIcon = true;
                $scope.showContent = true;
                $scope.showHome = false;
                $scope.showSettings = false;

                $scope.teamDesc = $scope.inputTeamDesc;
                $scope.productDesc = $scope.inputProductDesc;
            });
            reset();
        };
        $scope.add = $scope.edit;
        $scope.cancel = function() {
            $scope.showEditIcon = true;
            $scope.showContent = true;
            $scope.showHome = false;
            $scope.showSettings = false;
            reset();
        };

        function reset() {
            if (!$scope.teamDesc && !$scope.productDesc) {
                $scope.showEditIcon = false;
                $scope.showContent = false;
                $scope.showHome = true;
                $scope.showSettings = false;
            }
        }
        reset();
    }
]).controller('accountCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {
        $scope.password = '';
        $scope.password1 = '';
        $scope.password2 = '';

        $scope.error = false;
        $scope.message = '';

        $scope.save = function() {
            var url = '/api/user/account/password';
            if ($scope.password1 !== $scope.password2) {
                $scope.error = true;
                $scope.message = 'please input the same password';
            }
            var data = {
                originPassword: $scope.password,
                newPassword: $scope.password1
            };
            $http.post(url, data).success(function(data) {

            }).error(function(err) {
                $scope.error = true;
                $scope.message = err.message;
            });
        };
    }
]);