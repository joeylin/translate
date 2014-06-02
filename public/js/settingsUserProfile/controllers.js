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
        $scope.showAddIcon = false;
        $scope.showContent = false;
        $scope.showSettings = false;
        $scope.showHome = true;

        $scope.statusAdd = false;
        $scope.statusEdit = false;

        $scope.content = [];
        var itemNumber = '';
        $scope.add = function() {
            $scope.showAddIcon = false;
            $scope.showContent = false;
            $scope.showSettings = true;
            $scope.showHome = false;

            $scope.statusAdd = true;
            $scope.statusEdit = false;

            $scope.inputSchool = '';
            $scope.inputAcademy = '';
            $scope.inputStartDate = '';
            $scope.inputEndDate = '';
            $scope.inputDesc = '';
        };
        $scope.cancel = function() {
            $scope.showAddIcon = true;
            $scope.showContent = true;
            $scope.showSettings = false;
            $scope.showHome = false;

            reset();
        };
        $scope.addSave = function() {
            var data = {
                school: $scope.inputSchool,
                academy: $scope.inputAcademy,
                startDate: $scope.inputStartDate,
                endDate: $scope.inputEndDate,
                desc: $scope.inputDesc
            };
            $scope.content.push(data);
            $scope.showAddIcon = true;
            $scope.showContent = true;
            $scope.showSettings = false;
            $scope.showHome = false;
        };
        $scope.editSave = function() {
            $scope.showAddIcon = true;
            $scope.showContent = true;
            $scope.showSettings = false;
            $scope.showHome = false;

            var data = {
                school: $scope.inputSchool,
                academy: $scope.inputAcademy,
                startDate: $scope.inputStartDate,
                endDate: $scope.inputEndDate,
                desc: $scope.inputDesc
            };
            $scope.content[itemNumber] = data;
        };
        $scope.vm = {};
        $scope.vm.edit = function(item) {
            itemNumber = $scope.content.indexOf(item);
            $scope.inputSchool = item.school;
            $scope.inputAcademy = item.academy;
            $scope.inputStartDate = item.startDate;
            $scope.inputEndDate = item.endDate;
            $scope.inputDesc = item.desc;

            $scope.showAddIcon = false;
            $scope.showContent = false;
            $scope.showSettings = true;
            $scope.showHome = false;

            $scope.statusAdd = false;
            $scope.statusEdit = true;
        };
        $scope.vm.delete = function(item) {
            var index = $scope.content.indexOf(item);
            $scope.content.splice(index, 1);
            reset();
        };      
        function reset() {
            if ($scope.content.length === 0) {
                $scope.showAddIcon = false;
                $scope.showContent = false;
                $scope.showSettings = false;
                $scope.showHome = true;
            }
        }
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
                position: $scope.inputPosition,
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
            $scope.inputPosition = item.position;
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
                position: $scope.inputPosition,
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
]).controller('userImageCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {

    }
]).controller('worksCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {
        $scope.statusAdd = false;
        $scope.statusEdit = false;

        $scope.showAddIcon = false;
        $scope.showContent = false;
        $scope.showSettings = false;
        $scope.showHome = true;

        $scope.content = [];
        $scope.add = function() {
            $scope.showAddIcon = false;
            $scope.showContent = false;
            $scope.showSettings = true;
            $scope.showHome = false;

            $scope.statusAdd = true;
            $scope.statusEdit = false;

            $scope.inputUrl = '';
            $scope.inputDesc = '';
        };
        $scope.addSave = function() {
            var data = {
                url: $scope.inputUrl,
                desc: $scope.inputDesc
            };
            $scope.content.push(data);
            $scope.showAddIcon = true;
            $scope.showContent = true;
            $scope.showSettings = false;
            $scope.showHome = false;
        };
        $scope.cancel = function() {
            $scope.showAddIcon = true;
            $scope.showContent = true;
            $scope.showSettings = false;
            $scope.showHome = false;
            reset();
        };
        $scope.vm = {};
        var itemNumber = '';
        $scope.vm.edit = function(item) {
            itemNumber = $scope.content.indexOf(item);
            $scope.inputUrl = item.url;
            $scope.inputDesc = item.desc;

            $scope.showAddIcon = false;
            $scope.showContent = false;
            $scope.showSettings = true;
            $scope.showHome = false;

            $scope.statusAdd = false;
            $scope.statusEdit = true;
        };
        $scope.editSave = function() {
            var data = {
                url: $scope.inputUrl,
                desc: $scope.inputDesc
            };
            
            $scope.showAddIcon = true;
            $scope.showContent = true;
            $scope.showSettings = false;
            $scope.showHome = false;

            $scope.content[itemNumber] = data;
        };
        $scope.vm.delete = function(item) {
            var index = $scope.content.indexOf(item);
            $scope.content.splice(index, 1);
            reset();
        };
        function reset() {
            if ($scope.content.length === 0) {
                $scope.showAddIcon = false;
                $scope.showContent = false;
                $scope.showSettings = false;
                $scope.showHome = true;
            }
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
]).controller('socialCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope', '$location',
    function(app, $scope, $routeParams, $http, $rootScope, $location) {
        $scope.content = [];

        $scope.inputName = '';
        $scope.inputId = '';

        $scope.showAddIcon = false;
        $scope.showContent = false;
        $scope.showHome = true;
        $scope.showSettings = false;

        $scope.statusAdd = false;
        $scope.statusEdit = false;

        $scope.content = [];
        var itemNumber = '';
        $scope.add = function() {
            $scope.showAddIcon = false;
            $scope.showContent = false;
            $scope.showSettings = true;
            $scope.showHome = false;

            $scope.statusAdd = true;
            $scope.statusEdit = false;

            $scope.inputName = '';
            $scope.inputId = '';
        };
        $scope.cancel = function() {
            $scope.showAddIcon = true;
            $scope.showContent = true;
            $scope.showSettings = false;
            $scope.showHome = false;

            reset();
        };
        $scope.addSave = function() {
            var data = {
                name: $scope.inputName,
                id: $scope.inputId
            };
            $scope.content.push(data);
            $scope.showAddIcon = true;
            $scope.showContent = true;
            $scope.showSettings = false;
            $scope.showHome = false;
        };
        $scope.editSave = function() {
            $scope.showAddIcon = true;
            $scope.showContent = true;
            $scope.showSettings = false;
            $scope.showHome = false;

            var data = {
                name: $scope.inputName,
                id: $scope.inputId
            };
            $scope.content[itemNumber] = data;
        };
        $scope.vm = {};
        $scope.vm.edit = function(item) {
            itemNumber = $scope.content.indexOf(item);
            $scope.inputName = item.name;
            $scope.inputId = item.id;

            $scope.showAddIcon = false;
            $scope.showContent = false;
            $scope.showSettings = true;
            $scope.showHome = false;

            $scope.statusAdd = false;
            $scope.statusEdit = true;
        };
        $scope.vm.delete = function(item) {
            var index = $scope.content.indexOf(item);
            $scope.content.splice(index, 1);
            reset();
        };      
        function reset() {
            if ($scope.content.length === 0) {
                $scope.showAddIcon = false;
                $scope.showContent = false;
                $scope.showSettings = false;
                $scope.showHome = true;
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