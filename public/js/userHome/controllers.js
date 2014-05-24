'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('indexCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.pager = {
            hasNext: false,
            current: 0
        };
        $scope.content = [];
        $scope.newShare = '';
        $scope.total = 0;
        $scope.submit = function() {
            var url = '/api/share/save/';
            $http.post(url, {
                content: $scope.newShare,
            }).success(function(data) {
                $scope.content.push(data.share);
                $scope.total = data.total;
            });
        };
        var url = '/api/user/share';
        var params = {
            page: 0
        };
        var getShare = function() {
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
                $scope.total = data.total;
            });
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.page = $scope.pager.current;
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.prev = function() {
            if (!$scope.pager.current) {
                return false;
            }
            $scope.pager.current -= 1;
            params.page = $scope.pager.current;
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        }

        // share item && item comments
        $scope.vm = {};
        $scope.vm.toggleComment = function(share) {
            share.isShowComment = !share.isShowComment;
            if (share.isShowComment) {
                var url = '/api/share/' + share.id + '/comments';
                $http.get(url).success(function(data) {
                    share.comments = data.comments; 
                });
            }
        };
        $scope.vm.submitComment = function(share) {
            if (share.newComment === '') {
                return false;
            }
            var url = '/api/share/comments/add';
            $http.post(url,{
                shareId: share.id,
                content: share.newComment,
                replyTo: share.replyTo
            }).success(function(data) {
                share.comments.push(data.comment);
            });
        };
        $scope.vm.delete = function(comment, share) {
            var index = share.comments.indexOf(comment);
            var url = '/api/share/comments/delete';
            $http.post(url,{
                shareId: share.id,
                commentId: comment.id
            }).success(function(data) {
                share.comments.splice(index,1);
            });
        };
        $scope.vm.reply = function(comment) {
            comment.isShowReply = !comment.isShowReply;
            if (comment,isShowReply) {
                comment.newReply = 'reply to' + comment.user.username;
            }
        };

    }
]);