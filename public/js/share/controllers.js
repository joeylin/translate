'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('indexCtrl', ['app', '$scope', '$rootScope', '$location', '$http', 'wordCount',
    function(app, $scope, $rootScope, $location, $http, wordCount) {
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
        $scope.toggleCollect = function() {
            var url;
            if ($scope.share.has_collect) {
                url = '/api/user/uncollect';
                $http.post(url, {
                    id: $scope.share._id
                }).success(function(data) {
                    $scope.share.has_collect = false;
                });
            } else {
                url = '/api/user/collect';
                $http.post(url, {
                    id: $scope.share._id
                }).success(function(data) {
                    $scope.share.has_collect = true;
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

        // fork popup
        var global = app.rootScope.global;
        global.fork = {
            open: false,
            shareCount: 0,
            forkShare: '',
            share: null,
            close: function() {
                global.fork.open = false;
            }
        };
        global.fork.change = function() {
            global.fork.shareCount = wordCount(global.fork.forkShare);
        };   
        global.fork.submit = function() {
            var url = '/api/share/fork';
            if (global.fork.shareCount > 140) {
                return false;
            }
            if (global.fork.share.isFork) {
                $http.post(url, {
                    type: 'view',
                    isFork: true,
                    forkId: global.fork.share._id,
                    from: {
                        share: global.fork.share.from.share._id,
                        user: global.fork.share.from.user._id,
                        group: global.fork.share.from.group && global.fork.share.from.group._id
                    },
                    content: global.fork.forkShare
                }).success(function(data) {
                    global.fork.open = false;
                    global.fork.share.fork += 1;
                });
            } else {
                $http.post(url, {
                    type: 'view',
                    isFork: true,
                    forkId: global.fork.share._id,
                    from: {
                        share: global.fork.share._id,
                        user: global.fork.share.user._id,
                        group: global.fork.share.group && global.fork.share.group._id
                    },
                    content: global.fork.forkShare || '转发'
                }).success(function(data) {
                    global.fork.open = false;
                    global.fork.share.fork += 1;
                });
            }
        };
        $scope.forkPopup = function() {
            global.fork.open = true;
            global.fork.share = $scope.share;

            if ($scope.share.isFork) {
                global.fork.userName = $scope.share.from.user.name;
                global.fork.userId = $scope.share.from.user.id;
                global.fork.groupName = $scope.share.group && share.from.group.name;
                global.fork.groupId = $scope.share.group && share.from.group.id;
                global.fork.content = $scope.share.from.share.content;
                global.fork.forkShare = '//@' + $scope.share.user.name + ' ' + $scope.share.content;
            } else {
                global.fork.userName = $scope.share.user.name;
                global.fork.userId = $scope.share.user.id;
                global.fork.groupName =  $scope.share.group && $scope.share.group.name;
                global.fork.groupId = $scope.share.group && $scope.share.group.id; 
                global.fork.content = $scope.share.content;
                global.fork.date = $scope.share.createAt;
                global.fork.forkShare = '';
            }
            global.fork.change();
            setTimeout(function() {
                $('#forkText').focus();
            },200);
        };

        // init
        getTrends();
    }
]);