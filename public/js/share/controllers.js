'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('indexCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        $scope.share = app.share;
        if (app.author && app.author._id === app.share._id) {
            $scope.isMyShare = true;
        }
        var params = {
            page: 1,
            perPageItems: 50,
            shareId: $scope.share._id
        };
        var url;
        var getTrends = function() {
            url = '/api/share/comments';
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.share.comments = data.comments;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.page = $scope.pager.current;
            getTrends();
        };
        $scope.prev = function() {
            if (!$scope.pager.current) {
                return false;
            }
            $scope.pager.current -= 1;
            params.page = $scope.pager.current;
            getTrends();
        };
        $scope.toggleLike = function() {
            if (!app.author) {
                return false;
            }
            var url;
            if ($scope.share.liked) {
                url = '/api/share/unlike';
                $http.post(url, {
                    shareId: $scope.share._id
                }).success(function(data) {
                    $scope.share.liked = false;
                    $scope.share.likes -= 1;
                });
            } else {
                url = '/api/share/like';
                $http.post(url, {
                    shareId: $scope.share._id
                }).success(function(data) {
                    $scope.share.liked = true;
                    $scope.share.likes += 1;
                });
            }
        };
        $scope.submitComment = function() {
            if ($scope.share.newComment === '' || !app.author) {
                return false;
            }
            var url = '/api/share/comments/add';
            $http.post(url, {
                shareId: $scope.share._id,
                content: $scope.share.newComment,
                replyTo: $scope.share.replyTo
            }).success(function(data) {
                var comment = {
                    user: app.author,
                    content: $scope.share.newComment,
                    replyTo: $scope.share.replyTo,
                    _id: data.content._id,
                    date: data.content.createAt
                };
                $scope.share.comments.unshift(comment);
                $scope.share.total += 1;
                $scope.share.newComment = '';
            });
        };
        $scope.delete = function(comment) {
            if (!app.author) {
                return false;
            }
            var index = $scope.share.comments.indexOf(comment);
            var url = '/api/share/comments/delete';
            $http.post(url, {
                shareId: $scope.share._id,
                commentIndex: index
            }).success(function(data) {
                $scope.share.comments.splice(index, 1);
                $scope.share.total -= 1;
            });
        };
        $scope.reply = function(comment) {
            if (!app.author) {
                return false;
            }
            comment.isShowReply = !comment.isShowReply;
            if (comment.isShowReply) {
                comment.newComment = '@' + comment.user.name + ' ';
            }
        };
        $scope.submitInlineComment = function(comment) {
            if (comment.newComment === '' || !app.author) {
                return false;
            }
            var url = '/api/share/comments/add';
            $http.post(url, {
                shareId: $scope.share._id,
                content: comment.newComment,
                replyTo: comment.user._id
            }).success(function(data) {
                var result = {
                    user: app.author,
                    content: comment.newComment,
                    replyTo: comment.user._id,
                    _id: data.content._id,
                    date: data.content.createAt
                };
                $scope.share.comments.unshift(result);
                comment.isShowReply = false;
            });
        };

        $scope.post = function() {
            var url = '/api/job/post';
            var data = {
                id: app.share._id
            };
            $http.post(url, data).success(function(data) {
                $scope.share.hasPost = true;
                $scope.share.join += 1;
            });
        };

        // manage
        var getPostMember = function() {
            url = '/api/job/postList';
            params.page = 1;
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.postList = data.content;
            });
        };
        $scope.manage = function() {
            $scope.isManage = true;
            getPostMember();
        };
        $scope.back = function() {
            $scope.isManage = false;
        };

        // init
        getTrends();
    }
]).controller('jobManageCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var params = {
            page: 1,
            perPageItems: 50,
            shareId: $scope.share._id
        };
        var getPostMember = function() {
            var url = '/api/share/comments';
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.share.comments = data.comments;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.page = $scope.pager.current;
            getTrends();
        };
        $scope.prev = function() {
            if (!$scope.pager.current) {
                return false;
            }
            $scope.pager.current -= 1;
            params.page = $scope.pager.current;
            getTrends();
        };

        // init
        getPostMember();
    }
]);