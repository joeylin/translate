'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('newsCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        $scope.shareList = [];
        $scope.newShare = '';
        $scope.total = 0;
        $scope.submit = function() {
            var url = '/api/share/add';
            if ($scope.newShare === '') {
                return false;
            }
            $http.post(url, {
                type: 'view',
                content: $scope.newShare
            }).success(function(data) {
                var share = {
                    user: app.user,
                    comments: [],
                    likes: 0,
                    content: $scope.newShare,
                    liked: false,
                    _id: data.content._id,
                    createAt: data.content.createAt
                };
                $scope.shareList.unshift(share);
                $scope.newShare = '';
                $('#submit-success').css({
                    display: 'block'
                });
                setTimeout(function() {
                    $('#submit-success').css({
                        display: 'none'
                    });
                }, 1000);
            });
        };
        var url = '/api/user/trend';
        var params = {
            page: 1
        };
        var getTrend = function() {
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.shareList = data.content;
                $scope.pager.hasNext = data.hasNext;
                $scope.total = data.count;
            });
        };
        var getMyShare = function() {
            url = '/api/user/myShare';
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.shareList = data.content;
                $scope.hasNext = data.hasNext;
                $scope.total = data.count;
                $scope.isSearch = false;
            });
        };
        var getUserList = function() {
            var url = '/api/user/userList';
            $http.get(url).success(function(data) {
                var userList = data.userList || [];
                userList.push(app.user.name);
                $scope.userList = userList;
            });
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.page = $scope.pager.current;
            getTrend();
        };
        $scope.prev = function() {
            if ($scope.pager.current <= 1) {
                return false;
            }
            $scope.pager.current -= 1;
            params.page = $scope.pager.current;
            getTrend();
        };

        // share item && item comments
        $scope.vm = {};
        $scope.vm.toggleLike = function(share) {
            var url;
            if (share.liked) {
                url = '/api/share/unlike';
                $http.post(url, {
                    shareId: share._id
                }).success(function(data) {
                    share.liked = false;
                    share.likes -= 1;
                });
            } else {
                url = '/api/share/like';
                $http.post(url, {
                    shareId: share._id
                }).success(function(data) {
                    share.liked = true;
                    share.likes += 1;
                });
            }
        };
        $scope.vm.toggleComment = function(share) {
            share.isShowComment = !share.isShowComment;
            if (share.isShowComment) {
                var params = {
                    shareId: share._id
                };
                var url = '/api/share/comments';
                $http.get(url, {
                    params: params
                }).success(function(data) {
                    share.comments = data.comments;
                });
            }
        };
        $scope.vm.submitComment = function(share) {
            if (share.newComment === '') {
                return false;
            }
            var url = '/api/share/comments/add';
            $http.post(url, {
                shareId: share._id,
                content: share.newComment,
                replyTo: share.replyTo
            }).success(function(data) {
                var comment = {
                    user: app.user,
                    content: share.newComment,
                    replyTo: share.replyTo,
                    _id: data.content._id,
                    date: data.content.createAt
                };
                share.comments.unshift(comment);
                share.newComment = '';
            });
        };
        $scope.vm.deleteShare = function(share) {
            var url = '/api/share/delete';
            var data = {
                id: share._id
            };
            $http.post(url, data).success(function(data) {
                var index = $scope.shareList.indexOf(share);
                $scope.shareList.splice(index, 1);
            });
        };
        $scope.vm.delete = function(comment, share) {
            var index = share.comments.indexOf(comment);
            var url = '/api/share/comments/delete';
            $http.post(url, {
                shareId: share._id,
                commentIndex: index
            }).success(function(data) {
                share.comments.splice(index, 1);
            });
        };
        $scope.vm.reply = function(comment) {
            comment.isShowReply = !comment.isShowReply;
            if (comment.isShowReply) {
                comment.newComment = '@' + comment.user.name + ' ';
            }
        };
        $scope.vm.submitInlineComment = function(comment, share) {
            if (comment.newComment === '') {
                return false;
            }
            var url = '/api/share/comments/add';
            $http.post(url, {
                shareId: share._id,
                content: comment.newComment,
                replyTo: comment.user._id
            }).success(function(data) {
                var result = {
                    user: app.user,
                    content: comment.newComment,
                    replyTo: comment.user._id,
                    _id: data.content._id,
                    date: data.content.createAt
                };
                share.comments.unshift(result);
                comment.isShowReply = false;
            });
        };

        // for myshare search
        $scope.isSearch = false;
        $scope.vm.searchName = '';
        $scope.vm.enter = function() {
            url = '/api/user/myShare/search';
            params.keyword = $scope.vm.searchName;
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.shareList = data.content;
                $scope.hasNext = data.hasNext;
                $scope.total = data.count;
                $scope.isSearch = true;
            });
        };
        $scope.vm.getAll = function() {
            getMyShare();
        };

        // init
        if ($rootScope.current.path === 'news') {
            getTrend();
            getUserList();
        } else {
            getMyShare();
        }
    }
]).controller('notifyCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        var url = '/api/notify';
        $http.get(url).success(function(data) {
            var request = data.notify.request;
            var message = data.notify.message;

            $scope.total = request + message;
            $scope.request = request;
            $scope.message = message;
        });
    }
]).controller('requestCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        $scope.requests = [];

        var dispose = function() {
            $rootScope.current.request -= 1;
        };
        $scope.vm = {};
        $scope.vm.accept = function(request) {
            var params = {
                value: true,
                requestId: request._id
            };
            var checkUrl = '/api/connect/check';
            $http.post(checkUrl, params).success(function(data) {
                request.hasDisposed = true;
                request.isPass = true;
                $rootScope.request.connect -= 1;
            });
        };
        $scope.vm.reject = function(request) {
            var params = {
                value: false,
                requestId: request._id
            };
            var checkUrl = '/api/connect/check';
            $http.post(checkUrl, params).success(function(data) {
                request.hasDisposed = true;
                request.isPass = false;
                $rootScope.request.connect -= 1;
            });
        };
        // group
        $scope.vm.groupAccept = function(request) {
            var params = {
                value: true,
                requestId: request._id
            };
            var checkUrl = '/api/group/checkRequest';
            $http.post(checkUrl, params).success(function(data) {
                request.hasDisposed = true;
                request.isPass = true;
                $rootScope.request.group -= 1;
            });
        };
        $scope.vm.groupReject = function(request) {
            var params = {
                value: false,
                requestId: request._id
            };
            var checkUrl = '/api/group/checkRequest';
            $http.post(checkUrl, params).success(function(data) {
                request.hasDisposed = true;
                request.isPass = false;
                $rootScope.request.group -= 1;
            });
        };

        // comment reply
        $scope.vm.replyView = function(request) {
            if (request.hasDisposed) {
                return false;
            }
            var data = {
                groupId: request.group
            };
            var url = '/api/notify/reply/read';
            $http.post(url, function(data) {
                request.hasDisposed = true;
                $rootScope.request.reply -= 1;
            });
        };
        $scope.vm.commentView = function(request) {
            if (request.hasDisposed) {
                return false;
            }
            var data = {
                groupId: request.group
            };
            var url = '/api/notify/reply/read';
            $http.post(url, function(data) {
                request.hasDisposed = true;
                $rootScope.request.comment -= 1;
            });
        };

        var url;
        if ($rootScope.current.path === 'connect') {
            url = '/api/notify/connect';
        }
        if ($rootScope.current.path === 'group') {
            url = '/api/notify/group';
        }
        if ($rootScope.current.path === 'reply') {
            url = '/api/notify/reply';
        }
        if ($rootScope.current.path === 'comment') {
            url = '/api/notify/comment';
        }
        if ($rootScope.current.path === 'at') {
            url = '/api/notify/at';
        }
        if ($rootScope.current.path === 'all') {
            url = '/api/notify/all';
        }

        $http.get(url).success(function(data) {
            $scope.requests = data.requests;
        });
    }
]).controller('messageCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        var url = '/api/notify';
        $http.get(url).success(function(data) {
            var request = data.notify.request.length;
            var message = data.notify.message.length;

            $scope.total = request + message;
            $scope.request = request;
            $scope.message = message;
        });
    }
]).controller('peopleCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        $scope.name = '';
        $scope.keyword = '';
        $scope.content = [];
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        $scope.title = 'People You May Know';
        var url = '/api/search/people';
        var params = {
            pager: 1,
            name: $scope.name,
            keyword: $scope.keyword
        };
        $scope.submit = function() {
            // reset the config before submit
            var params = {
                pager: 1,
                name: $scope.name,
                keyword: $scope.keyword
            };
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.pager = $scope.pager.current;
            $scope.pager.link(url, params, function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.prev = function() {
            if (!$scope.pager.current) {
                return false;
            }
            $scope.pager.current -= 1;
            params.pager = $scope.pager.current;
            $scope.pager.link(url, params, function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        var addFilter = function(key, value) {
            params[key] = value;
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.addFilter = addFilter;
        $scope.enter = function(e, key, value) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13) {
                addFilter(key, value);
            }
        };

        // connect relative
        resetRelative();
        $scope.toggleMate = function() {
            if ($scope.isClassmate) {
                var index = $scope.relative.indexOf('classmate');
                $scope.relative.splice(index, 1);
            } else {
                $scope.relative.push('classmate');
            }
            $scope.isClassmate = !$scope.isClassmate;
        };
        $scope.toggleFellow = function() {
            if ($scope.isFellow) {
                var index = $scope.relative.indexOf('fellow');
                $scope.relative.splice(index, 1);
            } else {
                $scope.relative.push('fellow');
            }
            $scope.isFellow = !$scope.isFellow;
        };
        $scope.toggleFriend = function() {
            if ($scope.isFriend) {
                var index = $scope.relative.indexOf('friend');
                $scope.relative.splice(index, 1);
            } else {
                $scope.relative.push('friend');
            }
            $scope.isFriend = !$scope.isFriend;
        };
        $scope.toggleInterest = function() {
            if ($scope.isInterest) {
                var index = $scope.relative.indexOf('interest');
                $scope.relative.splice(index, 1);
            } else {
                $scope.relative.push('interest');
            }
            $scope.isInterest = !$scope.isInterest;
        };

        function resetRelative() {
            $scope.isClassmate = false;
            $scope.isFellow = false;
            $scope.isFriend = false;
            $scope.isInterest = false;
            $scope.relative = [];
        }
        $scope.connectUser = null;
        $scope.setRelative = function(user) {
            if (user.isConnected) {
                return false;
            }
            resetRelative();
            $scope.connectUser = user;
        };
        $scope.connect = function() {
            if ($scope.relative.length === 0) {
                return false;
            }
            var url = '/api/connect/send';
            $http.post(url, {
                id: $scope.connectUser._id,
                content: $scope.relative.join(','),
                type: 'connect'
            }).success(function(data) {
                $scope.connectUser.isConnected = true;
                $.magnificPopup.close();
            });
        };
        // default config
        $scope.years = '0-2';
    }
]).controller('shareCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        $scope.keyword = '';
        $scope.content = [];
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var url = '/api/search/share';
        var params = {
            pager: 0,
            keyword: $scope.keyword
        };
        $scope.submit = function() {
            // reset the config before submit
            var params = {
                pager: 0,
                keyword: $scope.keyword
            };
            get();
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.pager = $scope.pager.current;
            get();
        };
        $scope.prev = function() {
            if (!$scope.pager.current) {
                return false;
            }
            $scope.pager.current -= 1;
            params.pager = $scope.pager.current;
            get();
        };

        function get() {
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        }
        get();
    }
]).controller('jobCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        var url = '/api/job/latest';
        $scope.content = [];
        $scope.title = 'Latest Jobs';
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var params = {
            page: 1,
            payment: $scope.payment,
            degree: $scope.degree,
            years: $scope.years,
            type: $scope.type,
            location: $scope.location,
            keyword: $scope.keyword
        };
        var timeout = null;
        // todo need move to directive
        $('#keyword').on('focus', function() {
            app.applyFn(function() {
                $scope.showSubmitBtn = true;
            });
        });
        $('#keyword').on('blur', function() {
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                app.applyFn(function() {
                    $scope.showSubmitBtn = false;
                });
            }, 200);
        });
        $scope.submit = function() {
            // reset the config before submit
            url = '/api/job/search';
            clearTimeout(timeout);
            params.page = 1;
            params.keyword = $scope.keyword;
            params.payment = null;
            params.years = null;
            params.type = null;
            params.degree = null;
            params.location = null;
            get(function() {
                $('#keyword').focus();
                $scope.showSubmitBtn = true;
            });
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.page = $scope.pager.current;
            get();
        };
        $scope.prev = function() {
            if ($scope.pager.current <= 1) {
                return false;
            }
            $scope.pager.current -= 1;
            params.page = $scope.pager.current;
            get();
        };
        var addFilter = function(key, value) {
            params[key] = value;
            params.pager = 0;
            get();
        };
        $scope.addFilter = addFilter;
        $scope.enter = function(e, key, value) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13) {
                addFilter(key, value);
            }
        };
        $scope.save = function(job) {
            var url = '/api/job/save/';
            $http.post(url, {
                _id: job._id,
            }).success(function(data) {
                job.isSaved = true;
            });
        };

        function get(cb) {
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
                if (cb) {
                    cb();
                }
            });
        }

        // default config
        $scope.years = 'noLimit';
        $scope.degree = 'noLimit';
        $scope.payment = 'all';
        $scope.type = '';
        $scope.location = 'noLimit';
        get();


    }
]).controller('companyCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        $scope.content = [];
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var url = '/api/search/company';
        var params = {
            pager: 1,
            location: $scope.location,
            name: $scope.name,
            industry: $scope.industry,
            phase: $scope.phase
        };
        $scope.submit = function() {
            // reset the config before submit
            params.pager = 1;
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.pager = $scope.pager.current;
            $scope.pager.link(url, params, function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.prev = function() {
            if ($scope.pager.current <= 1) {
                return false;
            }
            $scope.pager.current -= 1;
            params.pager = $scope.pager.current;
            $scope.pager.link(url, params, function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        var addFilter = function(key, value) {
            params[key] = value;
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.addFilter = addFilter;
        $scope.enter = function(e, key, value) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13) {
                addFilter(key, value);
            }
        };
        $scope.follow = function(user) {
            var url = '/api/user/follow';
            var params = {
                userId: user._id
            };
            $http.post(url, params).success(function(data) {
                user.isFollowed = true;
            });
        };

        // default config
        $scope.phase = 'all';
    }
]).controller('myCompanyCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        var url = '/api/user/companys';
        $scope.content = [];
        $scope.industry = [];
        $scope.location = [];
        $scope.name = '';
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var params = {
            pager: 1
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.pager = $scope.pager.current;
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.prev = function() {
            if ($scope.pager.current <= 1) {
                return false;
            }
            $scope.pager.current -= 1;
            params.pager = $scope.pager.current;
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.enter = function(e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13) {
                $scope.searchByName();
            }
        };
        $scope.searchByName = function() {
            if ($scope.name === '') {
                return false;
            }
            params.name = $scope.name;
            params.pager = 1;
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.vm = {};
        $scope.vm.classify = function(key, value) {
            params.type = 'classify';
            params.name = key;
            params.value = value;
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.vm.unFollow = function(company) {
            var url = '/api/user/unFollow';
            var params = {
                userId: company._id
            };
            $http.post(url, params).success(function(data) {
                var index = $scope.content.indexOf(company);
                $scope.content.splice(index, 1);
            });
        };
    }
]).controller('myPeopleCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        $scope.title = 'All Connects';
        $scope.content = [];

        var url = '/api/connects';

        $scope.searchByName = function() {
            if ($scope.inputName === '') {
                return false;
            }
            var url = '/api/user/connects';
            var params = {
                name: $scope.inputName
            };
            $scope.title = 'Search By ' + $scope.inputName;
            $http.get(url, params).success(function(data) {
                $scope.content = data.content;
            });
        };

        $scope.vm = {};
        $scope.vm.page = {
            size: 30,
            index: 1
        };
        var removeUser = null;
        $scope.vm.triggerRemove = function(user) {
            removeUser = user;
        };
        $scope.vm.remove = function() {
            var url = '/api/connect/disconnect';
            var params = {
                connectId: removeUser._id
            };
            $http.post(url, params).success(function(data) {
                var index = $scope.content.indexOf(removeUser);
                $scope.content.splice(index, 1);
                $.magnificPopup.close();
            });
        };
        $scope.vm.close = function() {
            removeUser = null;
            $.magnificPopup.close();
        };
        $scope.vm.getAll = getConnects;

        $scope.vm.select = function(classify, name) {
            // todo 
        };

        function getConnects() {
            var url = '/api/connects';
            $http.get(url).success(function(data) {
                $scope.content = data.content;
            });
        }

        getConnects();
    }
]).controller('myShareCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        $scope.keyword = '';
        $scope.content = [];
        var url = '/api/user/share';
        var params = {
            pager: 0,
            keyword: $scope.keyword
        };
        $scope.submit = function() {
            // reset the config before submit
            var params = {
                pager: 0,
                keyword: $scope.keyword
            };
            get();
        };
        $scope.next = function() {
            if (!$scope.vm.pager.hasLast) {
                return false;
            }
            $scope.vm.pager.current += 1;
            params.pager = $scope.vm.pager.current;
            get();
        };
        $scope.prev = function() {
            if (!$scope.vm.pager.current) {
                return false;
            }
            $scope.vm.pager.current -= 1;
            params.pager = $scope.vm.pager.current;
            get();
        };

        function get() {
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.content = data.content;
                $scope.vm.pager.hasLast = data.hasLast;
            });
        }
        get();
    }
]).controller('myJobCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        var url = '/api/user/myjob';
        $scope.content = [];
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var params = {
            pager: 1
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.pager = $scope.pager.current;
            get();
        };
        $scope.prev = function() {
            if ($scope.pager.current <= 1) {
                return false;
            }
            $scope.pager.current -= 1;
            params.pager = $scope.pager.current;
            get();
        };
        $scope.tag = 'all';
        $scope.selectTag = function(tag) {
            $scope.tag = tag;
            if (tag === 'all') {
                params.status = undefined;
            }
            if (tag === 'publish') {
                params.status = 'publish';
            }
            if (tag === 'close') {
                params.status = 'close';
            }
            if (tag === 'draft') {
                params.status = 'draft';
            }
            get();
        };
        $scope.close = function(job) {
            var url = '/api/job/close';
            var data = {
                id: job._id
            };
            $http.post(url, data).success(function(data) {
                job.status = 'close';
            });
        };
        $scope.remove = function(job) {
            var url = '/api/job/remove';
            var data = {
                id: job._id
            };
            $http.post(url, data).success(function(data) {
                var index = $scope.content.indexOf(job);
                $scope.content.splice(index, 1);
            });
        };


        function get() {
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        }
        get();
    }
]).controller('mySendingCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        var url = '/api/user/sending';
        $scope.content = [];
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var params = {
            pager: 1
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.pager = $scope.pager.current;
            get();
        };
        $scope.prev = function() {
            if ($scope.pager.current <= 1) {
                return false;
            }
            $scope.pager.current -= 1;
            params.pager = $scope.pager.current;
            get();
        };

        function get() {
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
                setTimeout(function() {
                    $('.tsTooltip').tsTooltip();
                }, 16);
            });
        }
        get();
        // just for example
        $('.tsTooltip').tsTooltip();
    }
]).controller('myGroupCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        // create new group
        $scope.vm = {};
        $scope.vm.name = '';
        $scope.vm.industry = '';
        $scope.error = false;
        $scope.create = function() {
            if ($scope.vm.name === '' || $scope.vm.industry === '') {
                $scope.error = true;
                return false;
            }
            var url = '/api/group/create';
            var data = {
                name: $scope.vm.name,
                industry: $scope.vm.industry
            };
            $http.post(url, data).success(function(data) {
                $.magnificPopup.close();
                window.location.href = '/group/' + data.groupId + '/settings';
            });
        };
        $scope.change = function() {
            if ($scope.vm.name !== '' && $scope.vm.industry !== '') {
                $scope.error = false;
            }
        };

        $scope.vm.keyword = '';
        $scope.vm.isMe = false;
        $scope.search = function() {
            var url = '/api/group/search';
            var data = {
                keyword: $scope.vm.keyword,
                isMe: $scope.vm.isMe
            };
            $http.get(url, data).success(function(data) {
                $scope.content = data.content;
                $scope.isSearch = true;
            });
        };

        $scope.content = [];
        var getGroup = function() {
            var url = '/api/myGroup';
            $http.get(url).success(function(data) {
                $scope.content = data.content;
                $scope.isSearch = false;
            });
        };
        $scope.refresh = function() {
            getGroup();
        };

        getGroup();
    }
]).controller('newJobCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        $scope.type = 'full';
        $scope.paymentStart = '';
        $scope.paymentEnd = '';
        $scope.degree = '';
        $scope.position = '';
        $scope.location = '';
        $scope.summary = '';
        $scope.workYears = '';
        $scope.skills = '';

        $scope.showBlankError = false;
        $scope.showNothingError = false;
        $scope.submit = function() {
            var check = $scope.type === '' || $scope.paymentStart === '' || $scope.paymentEnd === '' || $scope.degree === '' || $scope.position === '' || $scope.skills === '' || $scope.summary === '' || $scope.location === '';
            if (check) {
                $scope.showBlankError = true;
                return false;
            }
            var url = '/api/share/add';
            var data = {
                type: 'job',
                status: 'publish',
                jobType: $scope.type,
                paymentStart: $scope.paymentStart,
                paymentEnd: $scope.paymentEnd,
                degree: $scope.degree,
                position: $scope.position,
                location: $scope.location,
                summary: $scope.summary,
                skills: $scope.skills,
                workYears: $scope.workYears
            };
            $http.post(url, data).success(function(data) {
                $location.path('/job');
            });
        };
        $scope.draft = function() {
            var check = $scope.paymentStart === '' && $scope.paymentEnd === '' && $scope.degree === '' && $scope.position === '' && $scope.summary === '' && $scope.location === '';
            if (check) {
                $scope.showNothingError = true;
                return false;
            }
            var url = '/api/share/add';
            var data = {
                type: 'job',
                status: 'draft',
                jobType: $scope.type,
                paymentStart: $scope.paymentStart,
                paymentEnd: $scope.paymentEnd,
                degree: $scope.degree,
                position: $scope.position,
                department: $scope.department,
                location: $scope.location,
                summary: $scope.summary,
                skills: $scope.skills,
                workYears: $scope.workYears
            };
            $http.post(url, data).success(function(data) {
                $location.path('/myJob');
            });
        };
        $scope.save = function() {
            var check = $scope.type === '' || $scope.paymentStart === '' || $scope.paymentEnd === '' || $scope.degree === '' || $scope.position === '' || $scope.skills === '' || $scope.summary === '' || $scope.location === '';
            if (check) {
                $scope.showBlankError = true;
                return false;
            }
            var url = '/api/share/edit';
            var data = {
                id: $scope.id,
                jobType: $scope.type,
                paymentStart: $scope.paymentStart,
                paymentEnd: $scope.paymentEnd,
                degree: $scope.degree,
                position: $scope.position,
                location: $scope.location,
                department: $scope.department,
                summary: $scope.summary,
                skills: $scope.skills,
                workYears: $scope.workYears
            };
            $http.post(url, data).success(function(data) {
                $location.path('/myJob');
            });
        };
        $scope.change = function() {
            $scope.showBlankError = false;
        };

        if ($rootScope.current.path === 'editJob') {
            $scope.title = 'Edit Job ' + $routeParams.id;
            var url = '/api/job/' + $routeParams.id;
            $http.get(url).success(function(data) {
                $scope.type = data.job.type;
                $scope.paymentStart = data.job.paymentStart;
                $scope.paymentEnd = data.job.paymentEnd;
                $scope.degree = data.job.degree;
                $scope.position = data.job.position;
                $scope.department = data.job.department;
                $scope.location = data.job.location;
                $scope.summary = data.job.summary;
                $scope.workYears = data.job.workYears;
                $scope.skills = data.job.skills;
                $scope.id = data.job.id;
            });
        } else {
            $scope.title = 'Create New Job';
        }
    }
]);