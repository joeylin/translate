'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('newsCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.pager = {
            hasNext: false,
            current: 0
        };
        $scope.shareList = [];
        $scope.newShare = '';
        $scope.total = 0;
        $scope.submit = function() {
            var url = '/api/share/add';
            $http.post(url, {
                content: $scope.newShare,
            }).success(function(data) {
                $scope.newShare = '';
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
            getShare();
        };
        $scope.prev = function() {
            if (!$scope.pager.current) {
                return false;
            }
            $scope.pager.current -= 1;
            params.page = $scope.pager.current;
            getShare();
        };

        // share item && item comments
        $scope.vm = {};
        $scope.vm.toggleComment = function(share) {
            share.isShowComment = !share.isShowComment;
            if (share.isShowComment) {
                var params = {
                    shareId: share._id
                };
                var url = '/api/share/comments';
                $http.get(url, params).success(function(data) {
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
            $http.post(url, {
                shareId: share.id,
                commentId: comment.id
            }).success(function(data) {
                share.comments.splice(index, 1);
            });
        };
        $scope.vm.reply = function(comment) {
            comment.isShowReply = !comment.isShowReply;
            if (comment.isShowReply) {
                comment.newComment = 'reply to ' + comment.user.username + ' : ';
            }
        };

        // init
        getShare();
    }
]).controller('notifyCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
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
]).controller('jobManageCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
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
]).controller('newPostCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        var editor = new Simditor({
            textarea: $('#post-editor'),
            placeholder: 'Enter content',
            pasteImage: true,
            toolbar: ['title', 'bold', 'italic', 'underline', 'strikethrough', '|', 'ol', 'ul', 'blockquote', 'code', 'table', '|', 'link', 'image', 'hr', '|', 'indent', 'outdent'],
            defaultImage: '/public/js/lib/simditor-1.0.3/images/image.png',
            upload: location.search === '?upload' ? {
                url: '/upload'
            } : false
        });
    }
]).controller('newJobCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
    function(app, $scope, $routeParams, $location, $http) {
        var editor = new Simditor({
            textarea: $('#job-editor'),
            placeholder: 'Enter content',
            pasteImage: true,
            toolbar: ['title', 'bold', 'italic', 'underline', 'strikethrough', '|', 'ol', 'ul', 'blockquote', 'code', 'table', '|', 'link', 'image', 'hr', '|', 'indent', 'outdent'],
            defaultImage: '/public/js/lib/simditor-1.0.3/images/image.png',
            upload: location.search === '?upload' ? {
                url: '/upload'
            } : false
        });
    }
]);