'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('userCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
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
                comment.newComment = 'reply to ' + comment.user.name + ' : ';
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

        // init
        getTrend();
    }
]).controller('companyCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
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
]).controller('userBasicCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        $scope.requests = [];
        var checkUrl = '/api/connect/check';
        var dispose = function() {
            $rootScope.current.request -= 1;
        };
        $scope.vm = {};
        $scope.vm.accept = function(request) {
            var params = {
                value: true,
                requestId: request._id
            };
            $http.post(checkUrl, params).success(function(data) {
                request.hasDisposed = true;
                dispose();
            });
        };
        $scope.vm.reject = function(request) {
            var params = {
                value: false,
                requestId: request._id
            };
            $http.post(checkUrl, params).success(function(data) {
                request.hasDisposed = true;
                dispose();
            });
        };
        var url = '/api/notify/request';
        $http.get(url).success(function(data) {
            $scope.requests = data.requests;
        });
    }
]).controller('companyBasicCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
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
]).controller('validateCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        $scope.name = '';
        $scope.keyword = '';
        $scope.content = [];
        $scope.isFilter = false;
        $scope.pager = {
            hasNext: false,
            current: 1
        };
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
        $scope.showFilter = function() {
            $scope.isFilter = true;
        };
        $scope.hideFilter = function() {
            $scope.isFilter = false;
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
        }
        $scope.toggleFriend = function() {
            if ($scope.isFriend) {
                var index = $scope.relative.indexOf('friend');
                $scope.relative.splice(index, 1);
            } else {
                $scope.relative.push('friend');
            }
            $scope.isFriend = !$scope.isFriend;
        }
        $scope.toggleInterest = function() {
            if ($scope.isInterest) {
                var index = $scope.relative.indexOf('interest');
                $scope.relative.splice(index, 1);
            } else {
                $scope.relative.push('interest');
            }
            $scope.isInterest = !$scope.isInterest;
        }

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
]).controller('userFinishCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
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
]).controller('companyFinishCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        var url = '/api/search/jobs';
        $scope.content = [];
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var params = {
            pager: 1,
            payment: $scope.payment,
            degree: $scope.degree,
            years: $scope.years,
            type: $scope.type,
            location: $scope.location,
            keyword: $scope.keyword
        };
        $scope.submit = function() {
            // reset the config before submit
            params.pager = 1;
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
            if ($scope.pager.current <= 1) {
                return false;
            }
            $scope.pager.current -= 1;
            params.pager = $scope.pager.current;
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

        // default config
        $scope.years = 'noLimit';
        $scope.degree = 'noLimit';
        $scope.payment = 'all';
        $scope.type = 'all';
        get();
    }
]);