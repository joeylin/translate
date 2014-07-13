'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('headerCtrl', ['app', '$scope', '$routeParams', 'getToc', 'getChapter', '$http',
    function(app, $scope, $routeParams, getToc, getChapter, $http) {
        $scope.display_name = app.user.display_name || 'add your display name';
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
            var url = '/api/userProfile/header';
            if ($scope.display_name === '') {
                return false;
            }
            var data = {
                display_name: $scope.display_name,
                signature: $scope.signature
            };
            $http.post(url, data).success(function() {
                $scope.showNameContent = true;
                $scope.showNameEdit = true;
                $scope.showNameInput = false;
            });
        }

        function setSign() {
            var url = '/api/userProfile/header';
            if ($scope.signature === '') {
                return false;
            }
            var data = {
                display_name: $scope.display_name,
                signature: $scope.signature
            };
            $http.post(url, data).success(function() {
                $scope.showSignContent = true;
                $scope.showSignEdit = true;
                $scope.showSignInput = false;
            });
        }

    }
]).controller('educationCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        $scope.showAddIcon = true;
        $scope.showContent = true;
        $scope.showSettings = false;
        $scope.showHome = false;

        $scope.statusAdd = false;
        $scope.statusEdit = false;

        $scope.content = app.profile.edu || [];
        var itemNumber = '';
        $scope.add = function() {
            $scope.showAddIcon = false;
            $scope.showContent = false;
            $scope.showSettings = true;
            $scope.showHome = false;

            $scope.statusAdd = true;
            $scope.statusEdit = false;

            $scope.inputSchool = '';
            $scope.inputField = '';
            $scope.inputStartYear = '';
            $scope.inputStartMonth = '';
            $scope.inputEndYear = '';
            $scope.inputEndMonth = '';
            $scope.inputDesc = '';
            $scope.inputDegree = '';
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
                field: $scope.inputField,
                startYear: $scope.inputStartYear,
                startMonth: $scope.inputStartMonth,
                endYear: $scope.inputEndYear,
                endMonth: $scope.inputEndMonth,
                degree: $scope.inputDegree,
                desc: $scope.inputDesc
            };
            var url = '/api/userProfile/edu';
            $http.post(url, {
                content: data,
                type: 'add'
            }).success(function() {
                $scope.content.push(data);
                $scope.showAddIcon = true;
                $scope.showContent = true;
                $scope.showSettings = false;
                $scope.showHome = false;
            });
        };
        $scope.editSave = function() {
            var data = {
                school: $scope.inputSchool,
                field: $scope.inputField,
                startYear: $scope.inputStartYear,
                startMonth: $scope.inputStartMonth,
                endYear: $scope.inputEndYear,
                endMonth: $scope.inputEndMonth,
                degree: $scope.inputDegree,
                desc: $scope.inputDesc,
            };
            var url = '/api/userProfile/edu';
            $http.post(url, {
                content: data,
                index: itemNumber,
                type: 'edit'
            }).success(function() {
                $scope.showAddIcon = true;
                $scope.showContent = true;
                $scope.showSettings = false;
                $scope.showHome = false;
                $scope.content[itemNumber] = data;
            });
        };
        $scope.vm = {};
        $scope.vm.edit = function(item) {
            itemNumber = $scope.content.indexOf(item);
            $scope.inputSchool = item.school;
            $scope.inputField = item.field;
            $scope.inputStartYear = item.startYear;
            $scope.inputStartMonth = item.startMonth;
            $scope.inputEndYear = item.endYear;
            $scope.inputEndMonth = item.endMonth;
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

            var url = '/api/userProfile/edu';
            $http.post(url, {
                index: index,
                type: 'delete'
            }).success(function() {
                $scope.content.splice(index, 1);
                reset();
            });
        };

        function reset() {
            if ($scope.content.length === 0) {
                $scope.showAddIcon = false;
                $scope.showContent = false;
                $scope.showSettings = false;
                $scope.showHome = true;
            }
        }
        reset();
    }
]).controller('experienceCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        $scope.content = app.profile.experience || [];
        $scope.showContent = true;
        $scope.showSettings = false;
        $scope.showHome = false;
        $scope.showAddIcon = true;

        $scope.inputCompany = '';
        $scope.inputTitle = '';
        $scope.inputDesc = '';
        $scope.inputStartYear = '';
        $scope.inputStartMonth = '';
        $scope.inputEndYear = '';
        $scope.inputEndMonth = '';
        $scope.inputIsCurrentJob = 'no';

        $scope.statusAdd = false;
        $scope.statusEdit = false;

        $scope.add = function() {
            $scope.showSettings = true;
            $scope.showContent = false;
            $scope.showHome = false;
            $scope.showAddIcon = false;

            $scope.inputCompany = '';
            $scope.inputTitle = '';
            $scope.inputDesc = '';
            $scope.inputStartYear = '';
            $scope.inputStartMonth = '';
            $scope.inputEndYear = '';
            $scope.inputEndMonth = '';
            $scope.inputIsCurrentJob = 'no';
            $scope.inputLocation = '';

            $scope.statusAdd = true;
            $scope.statusEdit = false;
        };
        $scope.addSave = function() {
            var data = {
                company: $scope.inputCompany,
                title: $scope.inputTitle,
                desc: $scope.inputDesc,
                startYear: $scope.inputStartYear,
                startMonth: $scope.inputStartMonth,
                endYear: $scope.inputEndYear,
                endMonth: $scope.inputEndMonth,
                location: $scope.inputLocation,
                isCurrentJob: $scope.inputIsCurrentJob
            };
            var url = '/api/userProfile/experience';
            $http.post(url, {
                content: data,
                type: 'add'
            }).success(function() {
                $scope.content.push(data);
                $scope.showSettings = false;
                $scope.showContent = true;
                $scope.showHome = false;
                $scope.showAddIcon = true;
            });
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
            $scope.inputTitle = item.title;
            $scope.inputDesc = item.desc;
            $scope.inputStartYear = item.startYear;
            $scope.inputStartMonth = item.startMonth;
            $scope.inputEndYear = item.endYear;
            $scope.inputEndMonth = item.endMonth;
            $scope.inputLocation = item.location;
            $scope.inputIsCurrentJob = item.isCurrentJob;

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
                title: $scope.inputTitle,
                desc: $scope.inputDesc,
                startYear: $scope.inputStartYear,
                startMonth: $scope.inputStartMonth,
                endYear: $scope.inputEndYear,
                endMonth: $scope.inputEndMonth,
                location: $scope.inputLocation,
                isCurrentJob: $scope.inputIsCurrentJob
            };
            var url = '/api/userProfile/experience';
            $http.post(url, {
                content: data,
                index: $scope.editNumber,
                type: 'edit'
            }).success(function() {
                $scope.content[$scope.editNumber] = data;
                $scope.showContent = true;
                $scope.showSettings = false;
                $scope.showHome = false;
                $scope.showAddIcon = true;
            });
        };
        $scope.vm.delete = function(item) {
            var index = $scope.content.indexOf(item);
            var url = '/api/userProfile/experience';
            $http.post(url, {
                index: index,
                type: 'delete'
            }).success(function(data) {
                $scope.content.splice(index, 1);
                reset();
            });
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
        $scope.name = app.user.name || 'add your realname';
        $scope.sex = app.user.sex || 'edit your sex';
        $scope.degree = app.user.degree || 'add your degree';
        $scope.workYear = app.user.workYear || 'how many';
        $scope.phone = app.user.phone || 'your cellphone';
        $scope.email = app.user.email || 'your email';
        $scope.avatar = app.user.avatar;

        $scope.showEditIcon = true;
        $scope.showContent = true;
        $scope.showSettings = false;

        $scope.edit = function() {
            $scope.showEditIcon = false;
            $scope.showContent = false;
            $scope.showSettings = true;

            $scope.inputName = $scope.name;
            $scope.inputSex = $scope.sex;
            $scope.inputDegree = $scope.degree;
            $scope.inputWorkYear = parseInt($scope.workYear, 10);
            $scope.inputPhone = $scope.phone;
            $scope.inputEmail = $scope.email;
        };
        $scope.save = function() {
            $scope.showEditIcon = true;
            $scope.showContent = true;
            $scope.showSettings = false;

            setValue({
                name: $scope.inputName,
                sex: $scope.inputSex,
                degree: $scope.inputDegree,
                workYear: $scope.inputWorkYear,
                phone: $scope.inputPhone,
                email: $scope.inputEmail
            });
        };
        $scope.cancel = function() {
            $scope.showEditIcon = true;
            $scope.showContent = true;
            $scope.showSettings = false;
        };

        $scope.$on('putFinish', function(event, imageUrl) {
            var data = {
                avatar: imageUrl
            };
            var url = '/api/userProfile/avatar';
            $http.post(url, data).success(function() {
                $scope.avatar = imageUrl;
            });
        });

        function setValue(obj) {
            var data = obj;
            var url = '/api/userProfile/basic';
            $http.post(url, obj).success(function() {
                $scope.name = obj.name;
                $scope.sex = obj.sex;
                $scope.degree = obj.degree;
                $scope.workYear = obj.workYear;
                $scope.phone = obj.phone;
                $scope.email = obj.email;
            });
        }
    }
]).controller('userImageCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {}
]).controller('worksCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {
        $scope.statusAdd = false;
        $scope.statusEdit = false;

        $scope.showAddIcon = true;
        $scope.showContent = true;
        $scope.showSettings = false;
        $scope.showHome = false;

        $scope.content = app.profile.works || [];
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

            var url = '/api/userProfile/works';
            $http.post(url, {
                content: data,
                type: 'add'
            }).success(function() {
                $scope.content.push(data);
                $scope.showAddIcon = true;
                $scope.showContent = true;
                $scope.showSettings = false;
                $scope.showHome = false;
            });
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
            var url = '/api/userProfile/works';
            $http.post(url, {
                content: data,
                index: itemNumber,
                type: 'edit'
            }).success(function() {
                $scope.showAddIcon = true;
                $scope.showContent = true;
                $scope.showSettings = false;
                $scope.showHome = false;
                $scope.content[itemNumber] = data;
            });
        };
        $scope.vm.delete = function(item) {
            var index = $scope.content.indexOf(item);
            var url = '/api/userProfile/works';
            $http.post(url, {
                index: index,
                type: 'delete'
            }).success(function() {
                $scope.content.splice(index, 1);
                reset();
            });
        };

        function reset() {
            if ($scope.content.length === 0) {
                $scope.showAddIcon = false;
                $scope.showContent = false;
                $scope.showSettings = false;
                $scope.showHome = true;
            }
        }
        reset();
    }
]).controller('describeCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {
        $scope.desc = app.profile.desc;

        $scope.showEditIcon = true;
        $scope.showContent = true;
        $scope.showHome = false;
        $scope.showSettings = false;

        $scope.edit = function() {
            $scope.showEditIcon = false;
            $scope.showContent = false;
            $scope.showHome = false;
            $scope.showSettings = true;

            $scope.inputDesc = $scope.desc;
        };
        $scope.save = function() {
            var data = {
                desc: $scope.inputDesc
            };
            var url = '/api/userProfile/desc';
            $http.post(url, data).success(function() {
                $scope.showEditIcon = true;
                $scope.showContent = true;
                $scope.showHome = false;
                $scope.showSettings = false;

                $scope.desc = $scope.inputDesc;
                reset();
            });

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
            if (!$scope.desc) {
                $scope.showEditIcon = false;
                $scope.showContent = false;
                $scope.showHome = true;
                $scope.showSettings = false;
            }
        }
        reset();
    }
]).controller('skillsCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {
        $scope.skills = app.user.skills;

        $scope.showEditIcon = true;
        $scope.showContent = true;
        $scope.showHome = false;
        $scope.showSettings = false;

        $scope.remove = function(item) {
            var index = $scope.skills.indexOf(item);
            $scope.skills.splice(index, 1);
        };
        $scope.add = function(item) {
            $scope.skills.push(item);
            var data = {
                skills: $scope.skills.join(',')
            };
            var url = '/api/user/skills';
            $http.post(url, data).success(function() {

            });

        };
    }
]).controller('socialCtrl', ['app', '$scope', '$routeParams', '$http', '$rootScope', '$location',
    function(app, $scope, $routeParams, $http, $rootScope, $location) {
        $scope.content = app.profile.social || [];

        $scope.inputName = '';
        $scope.inputId = '';

        $scope.showAddIcon = true;
        $scope.showContent = true;
        $scope.showHome = false;
        $scope.showSettings = false;

        $scope.statusAdd = false;
        $scope.statusEdit = false;

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
            var url = '/api/userProfile/social';
            $http.post(url, {
                content: data,
                type: 'add'
            }).success(function() {
                $scope.content.push(data);
                $scope.showAddIcon = true;
                $scope.showContent = true;
                $scope.showSettings = false;
                $scope.showHome = false;
            });
        };
        $scope.editSave = function() {
            var data = {
                name: $scope.inputName,
                id: $scope.inputId
            };
            var url = '/api/userProfile/social';
            $http.post(url, {
                content: data,
                index: itemNumber,
                type: 'edit'
            }).success(function() {
                $scope.content[itemNumber] = data;
                $scope.showAddIcon = true;
                $scope.showContent = true;
                $scope.showSettings = false;
                $scope.showHome = false;
            });
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
            var url = '/api/userProfile/social';
            $http.post(url, {
                index: index,
                type: 'delete'
            }).success(function() {
                $scope.content.splice(index, 1);
                reset();
            });
        };

        function reset() {
            if ($scope.content.length === 0) {
                $scope.showAddIcon = false;
                $scope.showContent = false;
                $scope.showSettings = false;
                $scope.showHome = true;
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