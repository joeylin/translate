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
            var key = e.keyCode || e.which;
            if (key === 13) {
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
            var key = e.keyCode || e.which;
            if (key === 13) {
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

        $scope.add = function() {
            $scope.showSettings = true;
            $scope.showContent = false;
            $scope.showHome = false;
            $scope.showAddIcon = false;
        };
        $scope.save = function() {
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
        };
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
        };
        $scope.vm.delete = function(item) {};
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
        app.clearUser();
        $scope.user = {
            name: '',
            password: ''
        };
        $scope.isError = false;
        $scope.submit = function() {
            $scope.login = 'Wait...';
            var user = $scope.user;
            var data = {
                name: user.name,
                password: user.password
            };

            data.logtime = Date.now() - app.timeOffset;
            app.restAPI.user.save({
                ID: 'login'
            }, data, function(data) {
                app.loginUser(data.user);
                $scope.$destroy();
                $location.path('/setings/user');
            }, function(data) {
                $scope.isError = true;
            });
        };
        $scope.enter = function(e) {
            var key = e.keyCode || e.which;
            if (key === 13) {
                $scope.submit();
            }
        };
        $scope.change = function() {
            $scope.isError = false;
        };
    }
]);