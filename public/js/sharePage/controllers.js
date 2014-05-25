'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('indexCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.pager = {
            hasNext: false,
            current: 0,
            isShow: true
        };
        $scope.comments = [];
        $scope.newComment = '';
        $scope.total = 0;
        $scope.submit = function() {
            if (share.newComment === '') {
                return false;
            }
            var url = '/api/share/' + app.id + '/comments/add';
            $http.post(url,{
                content: share.newComment,
                replyTo: share.replyTo
            }).success(function(data) {
                $scope.comments.push(data.comment);
            });
        };

        var url = '/api/share/' + app.id + '/comments';
        var params = {
            page: 0
        };
        var getComment = function() {
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.comments = data.content;
                $scope.pager.hasNext = data.hasNext;
                $scope.total = data.total;
                if ($scope.total < 20) {
                    $scope.pager = false;
                }
            });
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.page = $scope.pager.current;
            getComment();
        };
        $scope.prev = function() {
            if (!$scope.pager.current) {
                return false;
            }
            $scope.pager.current -= 1;
            params.page = $scope.pager.current;
            getComment();
        };

        $scope.vm.reply = function(comment) {
            comment.isShowReply = !comment.isShowReply;
            if (comment.isShowReply) {
                comment.newComment = 'reply to ' + comment.user.username + ' : ';
            }
        };
        $scope.vm.delete = function(comment) {
            var index = $scope.comments.indexOf(comment);
            var url = '/api/share/' + app.id + '/comments/add';
            $http.post(url,{
                shareId: share.id,
                commentId: comment.id
            }).success(function(data) {
                share.comments.splice(index,1);
            });
        };
    }
]);