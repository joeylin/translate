'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('headerCtrl', ['app', '$scope', '$routeParams', 'getToc', 'getChapter', '$http',
    function(app, $scope, $routeParams, getToc, getChapter, $http) {
        $scope.display_name = 'AmazingSurge';
        $scope.signature = 'Think different';

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
                return set();
            }
            var key = e.keyCode || e.which;
            if (key === 13) {
                $scope.showNameContent = true;
                $scope.showNameEdit = true;
                $scope.showNameInput = false;
            }

            function set() {
                $scope.showNameContent = true;
                $scope.showNameEdit = true;
                $scope.showNameInput = false;
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
                return set();
            }
            var key = e.keyCode || e.which;
            if (key === 13) {
                set();
            }

            function set() {
                $scope.showSignContent = true;
                $scope.showSignEdit = true;
                $scope.showSignInput = false;
            }
        };
    }
]).controller('basicCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        $scope.address = 'FuZhou';
        $scope.industry = 'Male';
        $scope.scale = '50-100';
        $scope.current = 'A';
        $scope.page = 'www.baidu.com';

        $scope.showEditIcon = true;
        $scope.showContent = true;
        $scope.showSettings = false;

        $scope.edit = function() {
            $scope.showEditIcon = false;
            $scope.showContent = false;
            $scope.showSettings = true;

            $scope.inputAddress = $scope.address;
            $scope.inputIndustry = $scope.industry;
            $scope.inputScale = $scope.scale;
            $scope.inputCurrent = $scope.current;
            $scope.inputPage = $scope.page;
        };
        $scope.save = function() {
            $scope.showEditIcon = true;
            $scope.showContent = true;
            $scope.showSettings = false;

            setValue({
                address: $scope.inputAddress,
                industry: $scope.inputIndustry,
                scale: $scope.inputScale,
                current: $scope.inputCurrent,
                page: $scope.inputPage
            });
        };
        $scope.cancel = function() {
            $scope.showEditIcon = true;
            $scope.showContent = true;
            $scope.showSettings = false;
        };

        function setValue(obj) {
            if (!obj) {
                obj = {};
            }
            $scope.address = obj.address || '';
            $scope.industry = obj.industry || '';
            $scope.scale = obj.scale || '';
            $scope.current = obj.current || '';
            $scope.page = obj.page || '';
        }
    }
]).controller('describeCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {
        $scope.desc = '';

        $scope.showEditIcon = false;
        $scope.showContent = false;
        $scope.showHome = true;
        $scope.showSettings = false;

        $scope.edit = function() {
            $scope.showEditIcon = false;
            $scope.showContent = false;
            $scope.showHome = false;
            $scope.showSettings = true;

            $scope.inputDesc = $scope.desc;
        };
        $scope.save = function() {
            $scope.showEditIcon = true;
            $scope.showContent = true;
            $scope.showHome = false;
            $scope.showSettings = false;

            $scope.desc = $scope.inputDesc;
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
            if ($scope.desc === '') {
                $scope.showEditIcon = false;
                $scope.showContent = false;
                $scope.showHome = true;
                $scope.showSettings = false;
            }
        }
    }
]).controller('accountCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {
        $scope.password = '';
        $scope.password1 = '';
        $scope.password2 = '';

        $scope.error = false;
        $scope.message = '';

        $scope.save = function() {

        };
    }
]);