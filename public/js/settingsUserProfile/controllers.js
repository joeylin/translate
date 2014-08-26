'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('headerCtrl', ['app', '$scope', '$routeParams','$http',
    function(app, $scope, $routeParams,$http) {
        $scope.name = app.user.name;
        $scope.signature = app.user.signature || '编辑你的签名';

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
            if ($scope.name === '') {
                return false;
            }
            var data = {
                name: $scope.name,
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
                name: $scope.name,
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
        $scope.workDate = {
            start: '',
            end: ''
        };

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
            $scope.workDate.start = '';
            $scope.workDate.end = '';
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
                startDate: $scope.workDate.start,
                endDate: $scope.workDate.end,
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
                startDate: $scope.workDate.start,
                endDate: $scope.workDate.end,
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
            $scope.workDate.start = item.startDate;
            $scope.workDate.end = item.endDate;
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
        $scope.inputIsCurrentJob = 'n';
        $scope.workDate = {
            start: '',
            end: ''
        };

        $scope.statusAdd = false;
        $scope.statusEdit = false;

        $scope.startDate = '';
        $scope.endDate = '';

        $scope.add = function() {
            $scope.showSettings = true;
            $scope.showContent = false;
            $scope.showHome = false;
            $scope.showAddIcon = false;

            $scope.inputCompany = '';
            $scope.inputTitle = '';
            $scope.inputDesc = '';
            $scope.inputIsCurrentJob = 'n';
            $scope.inputLocation = '';
            $scope.workDate = {
                start: '',
                end: ''
            };

            $scope.statusAdd = true;
            $scope.statusEdit = false;
        };
        $scope.addSave = function() {
            var data = {
                company: $scope.inputCompany,
                title: $scope.inputTitle,
                desc: $scope.inputDesc,
                startDate: $scope.workDate.start,
                endDate: $scope.workDate.end,
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
            $scope.workDate.start = item.startDate;
            $scope.workDate.end = item.endDate;
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
                startDate: $scope.workDate.start,
                endDate: $scope.workDate.end,
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
]).controller('basicCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        $scope.real_name = app.user.real_name || '';
        $scope.sex = app.user.sex || '';
        $scope.degree = app.user.degree || '';
        $scope.workYear = app.user.workYear || '';
        $scope.phone = app.user.phone || '';
        $scope.email = app.user.email || '';
        $scope.avatar = app.user.avatar;
        $scope.isPublic = app.user.isPubicBasic || false;

        $scope.showEditIcon = true;
        $scope.showContent = true;
        $scope.showSettings = false;

        $scope.edit = function() {
            $scope.showEditIcon = false;
            $scope.showContent = false;
            $scope.showSettings = true;

            $scope.inputRealName = $scope.real_name;
            $scope.inputSex = $scope.sex;
            $scope.inputDegree = $scope.degree;
            $scope.inputWorkYear = parseInt($scope.workYear, 10);
            $scope.inputPhone = $scope.phone;
            $scope.inputEmail = $scope.email;
            $scope.isInputPublic = $scope.isPublic;
        };
        $scope.save = function() {
            $scope.showEditIcon = true;
            $scope.showContent = true;
            $scope.showSettings = false;

            setValue({
                real_name: $scope.inputRealName,
                sex: $scope.inputSex,
                degree: $scope.inputDegree,
                workYear: $scope.inputWorkYear,
                phone: $scope.inputPhone,
                isPubicBasic: $scope.isInputPublic
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
                $rootScope.global.user.avatar = imageUrl;
            });
        });

        function setValue(obj) {
            var data = obj;
            var url = '/api/userProfile/basic';
            $http.post(url, obj).success(function() {
                $scope.real_name = obj.real_name;
                $scope.sex = obj.sex;
                $scope.degree = obj.degree;
                $scope.workYear = obj.workYear;
                $scope.phone = obj.phone;
                $scope.isPublic = obj.isPubicBasic;
            });
        }
    }
]).controller('currentCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        $scope.isPubicCurrent = app.user.isPubicCurrent;     
        $scope.location = app.user.location || '';
        $scope.occupation = app.user.occupation || '';
        $scope.status = app.user.status || '';
        $scope.company = app.user.company || '';
        $scope.school = app.user.school || '';
        
        setPanel();

        $scope.edit = function() {
            $scope.inputLocation = $scope.location;
            $scope.inputOccupation = $scope.occupation;
            $scope.inputStatus = $scope.status;
            $scope.inputCompany = $scope.company;
            $scope.inputSchool = $scope.school;

            $scope.showEditIcon = false;
            $scope.showHome = false;
            $scope.showContent = false;
            $scope.showSettings = true;
        };
        $scope.save = function() {
            if (!$scope.inputLocation) {
                $('#currentLocation').addClass('error');
                $('#currentError').css({display:'inline'});
                return false;
            }
            if (!$scope.inputOccupation) {
                $('#currentOccupation').addClass('error');
                $('#currentError').css({display:'inline'});
                return false;
            }
            if (!$scope.inputStatus) {
                $('#currentStatus').addClass('error');
                $('#currentError').css({display:'inline'});
                return false;
            }
            var data = {
                school: $scope.inputSchool,
                occupation: $scope.inputOccupation,
                status: $scope.inputStatus,
                company: $scope.inputCompany,
                location: $scope.inputLocation,
                isPubicCurrent: $scope.isPubicCurrent
            };
            var url = '/api/user/current';
            $http.post(url, data).success(function() {
                $scope.showEditIcon = true;
                $scope.showContent = true;
                $scope.showHome = false;
                $scope.showSettings = false;

                $scope.current =  $scope.isPubicCurrent;
                $scope.location = $scope.inputLocation;
                $scope.occupation = $scope.inputOccupation;
                $scope.status = $scope.inputStatus;
                $scope.company = $scope.inputCompany;
                $scope.school = $scope.inputSchool;
            });
        };
        $scope.cancel = function() {
            setPanel();
        };

        $('#currentLocation').add('#currentOccupation').add('#currentStatus').on('focus', function() {
            $(this).removeClass('error');
            $('#currentError').css({display:'none'});
        });
        function setPanel() {
            $scope.showSettings = false;
            if (!$scope.location || !$scope.occupation || !$scope.status ) {
                $scope.showHome = true;
                $scope.showContent = false;
                $scope.showEditIcon = false;
            } else {
                $scope.showHome = false;
                $scope.showContent = true;
                $scope.showEditIcon = true;
            }
        }
    }
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
        $scope.inputSkillName = '';

        $scope.vm = {};
        $scope.vm.remove = function(item) {
            var index = $scope.skills.indexOf(item);
            var data = {
                index: index
            };
            var url = '/api/user/skills/remove';
            $http.post(url, data).success(function(data) {
                $scope.skills.splice(index, 1);
            });
        };
        $scope.add = function() {
            var data = {
                name: $scope.inputSkillName
            };
            var url = '/api/user/skills/add';
            $http.post(url, data).success(function(data) {
                $scope.skills.push({
                    name: $scope.inputSkillName
                });
                $scope.showAddInput = false;
                $scope.inputSkillName = '';
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