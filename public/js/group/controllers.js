'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate', 'ui.bootstrap.pagination']).
controller('topicCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.isOpened = false;
        $scope.isSearch = false;
        $scope.keyword = '';
        $scope.open = function() {
            if (!app.author) {
                return $scope.$emit('popup', 'login');
            }
            if (!app.isJoined) {
                return $scope.$emit('popup', 'join');
            }
            $scope.isOpened = !$scope.isOpened;
        };
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
                type: 'group',
                group: app.group._id,
                content: $scope.newShare
            }).success(function(data) {
                var share = {
                    user: app.author,
                    comments: [],
                    likes: 0,
                    content: $scope.newShare,
                    liked: false,
                    _id: data.content._id,
                    createAt: data.content.createAt
                };
                $scope.shareList.unshift(share);
                $scope.newShare = '';
                $scope.isOpened = false;
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
        $scope.search = function() {
            url = '/api/group/' + app.group._id + '/search';
            params.keyword = $scope.keyword;
            params.page = 1;
            getTrend();
        };
        $scope.enter = function(e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13) {
                $scope.isSearch = true;
                $scope.search();
            }
        };
        var url = '/api/group/' + app.group._id + '/post';
        var params = {
            page: 1
        };
        $scope.backPost = function() {
            url = '/api/group/' + app.group._id + '/post';
            params.page = 1;
            $scope.isSearch = false;
            getTrend();
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
        var getMembersList = function() {
            var url = '/api/group/list';
            var data = {
                id: app.group._id
            };
            $http.post(url, data).success(function(data) {
                var userList = data.list || [];
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
        $scope.vm.deletePopup = function(share) {
            var shareDelete = function(cb) {
                var url = '/api/group/post/delete';
                var data = {
                    shareId: share._id
                };
                $http.post(url, data).success(function(data) {
                    var index = $scope.shareList.indexOf(share);
                    $scope.shareList.splice(index, 1);
                    cb();
                });
            };
            $scope.$emit('popup', 'shareDelete', shareDelete);
        };
        $scope.vm.toggleLike = function(share) {
            var url;
            if (!app.author) {
                return false;
            }
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
                    user: app.author,
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
                    user: app.author,
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
        getMembersList();
    }
]).controller('settingsCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        $scope.current = 'b';
        $scope.groupId = app.group.id;
        $scope.members = [];
        $scope.admin = [];
        $scope.basic = {};
        $scope.basic.avatar = app.group.avatar;
        $scope.basic.name = app.group.name;
        $scope.basic.industry = app.group.industry;
        $scope.basic.announcement = app.group.announcement;

        $scope.clickMember = function() {
            if ($scope.current === 'm') {
                return false;
            } else {
                $scope.current = 'm';
                getMembers();
            }
        };
        // basic
        $scope.isSuccess = false;
        $scope.$on('putFinish', function(event, imageUrl) {
            var data = {
                id: app.group._id,
                avatar: imageUrl
            };
            var url = '/api/group/settings/avatar';
            $http.post(url, data).success(function() {
                $scope.basic.avatar = imageUrl;
            });
        });
        $scope.save = function() {
            var url = '/api/group/settings/basic';
            var data = {
                id: app.group._id,
                name: $scope.basic.name,
                industry: $scope.basic.industry,
                announcement: $scope.basic.announcement
            };
            $http.post(url, data).success(function(data) {
                app.group.announcement = $scope.basic.announcement;
                $scope.isSuccess = true;
                app.timeout(function() {
                    $scope.isSuccess = false;
                }, 1000);
            });
        };
        $scope.quit = function() {
            $scope.$emit('popup', 'quit');
        };
        // members
        var vm = $scope.vm = {};
        vm.page = {
            size: 20,
            index: 1
        };
        vm.sort = {
            column: '',
            direction: -1,
            toggle: function(column) {
                if (column.sortable === false)
                    return;

                if (this.column === column.name) {
                    this.direction = -this.direction || -1;
                } else {
                    this.column = column.name;
                    this.direction = -1;
                }
            }
        };
        // 构建模拟数据
        vm.columns = [{
            label: 'name',
            name: 'name',
            type: 'string'
        }, {
            label: 'post',
            name: 'post',
            type: 'number'
        }, {
            label: 'operate',
            name: 'actions',
            sortable: false
        }];

        function getMembers() {
            var url = '/api/group/members';
            var data = {
                id: app.group._id
            };
            $http.post(url, data).success(function(data) {
                $scope.creator = data.creator;
                $scope.admin = data.admin;
                $scope.members = data.members;
            });
        }
        $scope.refresh = function() {
            getMembers();
            vm.sort.column = '';
        };
        vm.deleteMember = function(item) {
            var del = function(cb) {
                var url = '/api/group/member/delete';
                var data = {
                    id: app.group._id,
                    deleteId: item._id
                };
                $http.post(url, data).success(function(data) {
                    var index = $scope.members.indexOf(item);
                    $scope.members.splice(index, 1);
                    cb();
                });
            };
            $scope.$emit('popup', 'memberDelete', del);
        };
        vm.removeAdmin = function(item) {
            var url = '/api/group/admin/delete';
            var data = {
                id: app.group._id,
                deleteId: item._id
            };
            $http.post(url, data).success(function(data) {
                item.isAdmin = false;
                var index = $scope.admin.indexOf(item);
                $scope.admin.splice(index, 1);
                $scope.members.push(item);
            });
        };
        vm.addAdmin = function(item) {
            if ($scope.admin.length > 5) {
                return false;
            }
            var url = '/api/group/admin/add';
            var data = {
                id: app.group._id,
                adminId: item._id
            };
            $http.post(url, data).success(function(data) {
                item.isAdmin = true;
                var index = $scope.members.indexOf(item);
                $scope.members.splice(index, 1);
                $scope.admin.push(item);
            });
        };
    }
]);