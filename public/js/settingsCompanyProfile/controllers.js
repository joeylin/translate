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
        $scope.name = 'Joeylin';
        $scope.sex = 'Male';
        $scope.edu = 'Master';
        $scope.year = 2;
        $scope.phone = '18650330481';
        $scope.email = '331547274@qq.com';
        $scope.avatar = '';

        $scope.showEditIcon = true;
        $scope.showContent = true;
        $scope.showSettings = false;

        $scope.edit = function() {
            $scope.showEditIcon = false;
            $scope.showContent = false;
            $scope.showSettings = true;

            $scope.inputName = $scope.name;
            $scope.inputSex = $scope.sex;
            $scope.inputEdu = $scope.edu;
            $scope.inputYear = $scope.year;
            $scope.inputPhone = $scope.phone;
            $scope.inputEmail = $scope.email;
            $scope.inputAvatar = $scope.avatar;
        };
        $scope.save = function() {
            $scope.showEditIcon = true;
            $scope.showContent = true;
            $scope.showSettings = false;

            setValue({
                name: $scope.inputName,
                sex: $scope.inputSex,
                edu: $scope.inputEdu,
                year: $scope.inputYear,
                phone: $scope.inputPhone,
                email: $scope.inputEmail,
                avatar: $scope.inputAvatar
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
            $scope.name = obj.name || '';
            $scope.sex = obj.sex || '';
            $scope.edu = obj.edu || '';
            $scope.year = obj.year || '';
            $scope.phone = obj.phone || '';
            $scope.email = obj.email || '';
            $scope.avatar = obj.avatar || '';
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
]);