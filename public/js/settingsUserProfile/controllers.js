'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('headerCtrl', ['app', '$scope', '$routeParams', 'getToc', 'getChapter', '$http',
    function(app, $scope, $routeParams, getToc, getChapter, $http) {
        $scope.display_name = 'joeylin';
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
]).controller('educationCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {

    }
]).controller('experienceCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        $scope.content = [];
        $scope.showContent = true;
        $scope.showSettings = false;
        $scope.showHome = false;
        $scope.showAddIcon = true;

        $scope.inputCompany = '';
        $scope.inputPosition = '';
        $scope.inputDesc = '';
        $scope.inputStartDate = '';
        $scope.inputEndDate = '';

        $scope.statusAdd = false;
        $scope.statusEdit = false;

        $scope.add = function() {
            $scope.showSettings = true;
            $scope.showContent = false;
            $scope.showHome = false;
            $scope.showAddIcon = false;

            $scope.inputCompany = '';
            $scope.inputPosition = '';
            $scope.inputDesc = '';
            $scope.inputStartDate = '';
            $scope.inputEndDate = '';

            $scope.statusAdd = true;
            $scope.statusEdit = false;
        };
        $scope.addSave = function() {
            $scope.showSettings = false;
            $scope.showContent = true;
            $scope.showHome = false;
            $scope.showAddIcon = true;

            var data = {
                company: $scope.inputCompany,
                postion: $scope.inputPosition,
                desc: $scope.inputDesc,
                startDate: $scope.inputStartDate,
                endDate: $scope.inputEndDate
            };
            $scope.content.push(data);
        };
        $scope.cancel = function() {
            $scope.showContent = true;
            $scope.showSettings = false;
            $scope.showHome = false;
            $scope.showAddIcon = true;
            reset();
        };
        $scope.vm = {};
        $scope.editNumber = '';
        $scope.vm.edit = function(item) {
            $scope.inputCompany = item.company;
            $scope.inputPosition = item.postion;
            $scope.inputDesc = item.desc;
            $scope.inputStartDate = item.startDate;
            $scope.inputEndDate = item.endDate;

            $scope.showSettings = true;
            $scope.showContent = false;
            $scope.showHome = false;
            $scope.showAddIcon = false;

            $scope.statusAdd = false;
            $scope.statusEdit = true;

            var index = $scope.content.indexOf(item);
            $scope.editNumber = index;
        };
        $scope.editSave = function(item) {
            var data = {
                company: $scope.inputCompany,
                postion: $scope.inputPosition,
                desc: $scope.inputDesc,
                startDate: $scope.inputStartDate,
                endDate: $scope.inputEndDate
            };
            $scope.content[$scope.editNumber] = data;

            $scope.showContent = true;
            $scope.showSettings = false;
            $scope.showHome = false;
            $scope.showAddIcon = true;
        };
        $scope.vm.delete = function(item) {
            var index = $scope.content.indexOf(item);
            $scope.content.splice(index, 1);
            reset();
        };

        function reset() {
            if ($scope.content.length === 0) {
                $scope.showContent = false;
                $scope.showSettings = false;
                $scope.showHome = true;
                $scope.showAddIcon = false;
            }
        }
        reset();
    }
]).controller('basicCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        $scope.originPassword = '';
        $scope.newPassword = '';
        $scope.repeatPassword = '';

        $scope.isError = false;
        $scope.errorMsg = '';

        $scope.saveBtn = 'save';
        $scope.save = function() {
            var url = '/api/user/edit/password';
            var data = {
                originPassword: $scope.originPassword,
                newPassword: $scope.newPassword,
            };
            if ($scope.newPassword !== $scope.repeatPassword) {
                $scope.isError = true;
                $scope.errorMsg = 'cant be blank !';
            } else {
                $http.post(url, data).success(function(data) {
                    $scope.saveBtn = 'isSaved';
                    app.updateUser(data.user);
                });
            }
        };
        $scope.change = function() {
            $scope.saveBtn = 'save';
            $scope.isError = false;
        };
    }
]).controller('userImageCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        var user = app.getUser();
        $scope.avatar = user.avatar;

        // btn
        $scope.saveBtn = 'save';
        $scope.save = function() {
            var url = '/api/user/edit/avatar';
            var data = {
                avatar: $scope.avatar
            };
            $http.post(url, data).success(function(data) {
                $scope.saveBtn = 'isSaved';
                app.updateUser(data.user);
            });
        };
        $scope.change = function() {
            $scope.saveBtn = 'save';
            $scope.isError = false;
        };

    }
]).controller('worksCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {

    }
]).controller('describeCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {

    }
]).controller('socialCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope', '$location',
    function(app, $scope, $routeParams, $http, $rootScope, $location) {

    }
]);