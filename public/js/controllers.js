'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('chapterCtrl', ['app', '$scope', '$routeParams', 'getToc', 'getChapter', '$http',
    function(app, $scope, $routeParams, getToc, getChapter, $http) {
        var doc = $routeParams.doc;
        var chapter = $routeParams.chapter;
        var update = function(cb) {
            getChapter(doc, chapter).then(function(data) {
                data.sections.map(function(value, key) {
                    value.saveTitle = 'save';
                    value.newTrans = value.md;
                });
                $scope.doc.chapter = data;
                if (typeof cb === 'function') {
                    cb();
                }
            });
        };
        $scope.doc = {
            name: $routeParams.doc,
            translate: false
        };
        $scope.status = {
            read: true,
            translate: false,
            origin: false
        };
        $scope.doc.makeTranslate = function() {
            if (!app.auth()) {
                return false;
            }
            $scope.status.read = false;
            $scope.status.translate = true;
            $scope.status.orgin = false;
            setTimeout(function() {
                $('#translateView').find('textarea').each(function(key, value) {
                    $(value).height(value.scrollHeight);
                });
            }, 10);
        };
        $scope.doc.getOrigin = function() {
            $scope.status.read = false;
            $scope.status.translate = false;
            $scope.status.origin = true;
        };
        $scope.doc.getRead = function() {
            if ($scope.status.translate) {
                update(function() {
                    $scope.status.read = true;
                    $scope.status.translate = false;
                    $scope.status.origin = false;
                });
            } else {
                $scope.status.read = true;
                $scope.status.translate = false;
                $scope.status.origin = false;
            }
        };
        $scope.save = function(section) {
            var url = '/api/translate/save';
            if (section && !section.newTrans) {
                return false;
            }
            if (section.isSaved) {
                return false;
            }
            var data = {
                id: section.id,
                user: app.getUser().username,
                content: section.newTrans
            };
            $http.post(url, data).success(function(data, status) {
                section.saveTitle = 'saved';
                section.isSaved = true;
            });
        };
        $scope.change = function(section) {
            section.isSaved = false;
            section.saveTitle = 'save';
        };
        $scope.setFinish = function(section) {
            var url, data;
            if (!section.isFinished.value && app.auth()) {
                url = '/api/section/finish';
                data = {
                    id: section.id,
                    userId: app.getUser().uid
                };
                $http.post(url, data).success(function(data, status) {
                    section.isFinished.value = true;
                });
            }
        };
        update();
    }
]).controller('docHomeCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        var doc = $routeParams.doc;
        var url = '/api/doc/' + doc + '/detail';
        $scope.doc = {};
        $http.get(url).success(function(err, data) {
            $scope.doc.detail = data.detail;
            $scope.doc.des = data.des;
            $scope.doc.attachContent = data.attachContent;
        });
    }
]).controller('tocCtrol', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {
        $scope.doc = app.tocCtrl;
        $scope.current = $scope.doc.chapter;
        var name = $scope.doc.docName;
        $scope.setCurrent = function(index) {
            $scope.current = $scope.doc.toc[index].name;
        };
        $scope.delChapter = function(index) {
            var chapter = $scope.doc.toc[index];
            var url = '/api/edit/doc/' + name + '/delChapter';
            var data = {};
            $http.post(url, data).success(function(err) {
                $scope.doc.toc.splice(index, 1);
            });
        };
        $rootScope.$on('tocChange.ts', function(oldValue, newValue) {
            // newValue = {name:'xxx',id:'xxx'};
            var index;
            $scope.doc.toc.map(function(value, key) {
                if (value.name === oldValue) {
                    index = key;
                    return;
                }
            });
            $scope.doc.toc.splice(index, 1, newValue);
        });
        $rootScope.$on('tocAdd.ts', function(newValue) {
            $scope.doc.toc.push(newValue);
        });
        $rootScope.$on('autoRedirect.ts', function() {
            // waiting to do
            app.location();
        });
    }
]).controller('editChapter', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {
        var chapter = $routeParams.chapter;
        var doc = $routeParams.doc;
        var url = '/api/chapter/' + doc + '/' + chapter + '/md';
        $http.get(url).success(function(err, data) {
            $scope.chapter = {
                name: data.chapter.name,
                content: data.chapter.content
            };
        });
        $scope.save = function() {
            var url = '';
            var data = {};
            $http.post(url, data).success(function(err, data) {
                $rootScope.$emit('tocChange.ts', $scope.chapter);
            });
        };
        $scope.isPreview = false;
        $scope.preview = function() {
            $scope.isPreview = true;
        };
        $scope.edit = function() {
            $scope.isPreview = false;
        };

    }
]).controller('addChapter', ['app', '$scope', '$routeParams', '$http', '$rootScope',
    function(app, $scope, $routeParams, $http, $rootScope) {
        $scope.doc = app.tocCtrl;
        $scope.current = $scope.doc.chapter;
        var name = $scope.doc.docName;
        $scope.setCurrent = function(index) {
            $scope.current = $scope.doc.toc[index].name;
        };
        $scope.delChapter = function(index) {
            var chapter = $scope.doc.toc[index];
            var url = '/api/edit/doc/' + name + '/delChapter';
            var data = {};
            $http.post(url, data).success(function(err) {
                $scope.doc.toc.splice(index, 1);
            });
        };
        $rootScope.on('tocChange.ts', function() {

        });
    }
]).controller('userLoginCtrl', ['app', '$scope',
    function(app, $scope) {
        app.clearUser();
        $scope.user = {
            username: '',
            password: ''
        };
        $scope.submit = function() {
            $scope.login = 'Wait...';
            var user = $scope.user;
            var data = {
                username: user.username,
                password: user.password
            };

            data.logtime = Date.now() - app.timeOffset;
            app.restAPI.user.save({
                ID: 'login'
            }, data, function(data) {
                app.loginUser(data.user);
                $('#menuLogin').removeClass('open');
                $scope.$destroy();
            }, function(data) {
                $scope.$emit('shake');
                $scope.login = 'Login';
            });
        };
        $scope.enter = function(e) {
            var key = e.keyCode || e.which;
            if (key === 13) {
                $scope.submit();
            }
        }
    }
]).controller('userRegisterCtrl', ['app', '$scope',
    function(app, $scope) {
        var global = app.rootScope.global;
        app.clearUser();
        $scope.user = {
            username: '',
            email: '',
            password: '',
            password2: ''
        };
        $scope.signup = 'Sign Up';
        $scope.submit = function() {
            var user = $scope.user;
            $scope.signup = 'Wait...';

            var data = {
                username: user.username,
                email: user.email
            };
            data.password = user.password;
            app.restAPI.user.save({
                ID: 'register'
            }, data, function(data) {
                app.loginUser(data.user);
                $scope.signup = 'Sign Up';
                $('#menuLogin').removeClass('open');
            }, function() {
                $scope.$emit('shake');
                $scope.signup = 'Sign Up';
            });
        };
        $scope.enter = function(e) {
            var key = e.keyCode || e.which;
            if (key === 13) {
                $scope.submit();
            }
        }
    }
]).controller('settingsCtrl', ['app', '$scope',
    function(app, $scope) {
        $scope.logout = function() {
            app.restAPI.user.get({
                ID: 'logout'
            }, function() {
                app.clearUser();
            });
        };

    }
]);