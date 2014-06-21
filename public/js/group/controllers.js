'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate', 'ui.bootstrap.pagination']).
controller('topicCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.isOpened = false;
        $scope.open = function() {
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
                type: 'view',
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
        var url = '/api/group/' + app.group._id + '/post';
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
            if ($scope.current === 'c') {
                return false;
            }
            getMembers();
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
                $scope.isSuccess = true;
                app.timeout(function() {
                    $scope.isSuccess = false;
                }, 1000);
            });
        };
        $scope.quit = function() {
            var url = '/api/group/quit';
            var data = {
                id: app.group._id
            };
            $http.post(url, data).success(function(data) {
                $location.path('/group/' + app.group.id);
            });
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
            var url = '/api/group/member/delete';
            var data = {
                id: app.group._id,
                deleteId: item._id
            };
            $http.post(url.data).success(function(data) {
                var index = vm.items.indexOf(item);
                vm.items.splice(index, 1);
            });
        };
        vm.removeAdmin = function(item) {
            var url = '/api/group/admin/delete';
            var data = {
                id: app.group._id,
                deleteId: item._id
            };
            $http.post(url, data).success(function(data) {
                item.isAdmin = false;
                vm.items = sort(vm.items);
            });
        };
        vm.addAdmin = function(item) {
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

        var MAX_NUM = 10;

        function rand(min, max) {
            return min + Math.round(Math.random() * (max - min));
        }
        $scope.creator = {
            _id: 'xxxx',
            name: 'joeylin',
            post: 233948,
            isCreator: true,
            isAdmin: false,
        };
        $scope.admin = [{
            name: 'laolei',
            post: 233948,
            isCreator: false,
            isAdmin: true,
        }, {
            name: 'howell',
            post: 233948,
            isCreator: false,
            isAdmin: true,
        }];
        for (var i = 0; i < MAX_NUM; ++i) {
            var id = rand(0, MAX_NUM);
            $scope.members.push({
                name: 'Name' + id, // 字符串类型
                post: rand(0, 100 * 1000 * 1000), // 数字类型
                isCreator: false,
                isAdmin: false
            });
        }
    }
]);