'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate','ui.bootstrap.pagination']).
controller('topicCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        $scope.shareList = [];
        $scope.newShare = '';
        $scope.total = 0;
        $scope.submit = function() {
            var url = '/api/group/id/add';
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
        var url = '/api/group/id/topics';
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
]).controller('settingsCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        $scope.current = 'b';
        // basic
        $scope.name = '';
        $scope.industry = '';
        $scope.announcement = '';
        $scope.isSuccess = false;
        $scope.save = function() {
            var url = '/api/group/settings/basic';
            var data = {
                id: app.group._id,
                name: $scope.name,
                industry: $scope.industry,
                announcement: $scope.announcement
            };
            $.post(url,data).success(function(data) {
                $scope.isSuccess = true;
                app.timeout(function() {
                    $scope.isSuccess = false;
                }, 1000);
            });
        };
        // members
        var vm = $scope.vm = {};
        vm.items = [];
        vm.page = {
          size: 20,
          index: 1
        };
        vm.sort = {
          column: 'id',
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
        vm.columns = [
          {
            label: 'name',
            name: 'name',
            type: 'string'
          },
          {
            label: 'post',
            name: 'post',
            type: 'number'
          },
          {
            label: 'operate',
            name: 'actions',
            sortable: false
          }
        ];
        function getMembers() {
            var url = '/api/group/members';
            var data = {
                id: app.group._id
            };
            $http.post(url,data).success(function(data) {
                vm.items = data.content;
            });
        }
        $scope.refresh = function() {
            getMembers();
        };
        vm.deleteMember = function(item) {
            var url = '/api/group/member/delete';
            var data = {
                id: app.group._id,
                deleteId: item._id
            };
            $http.post(url.data).success(function(data) {
                var index = vm.items.indexOf(item);
                vm.items.splice(index,1);
            }); 
        };
        vm.removeAdmin = function(item) {
            var url = '/api/group/admin/delete';
            var data = {
                id: app.group._id,
                deleteId: item._id
            };
            $http.post(url,data).success(function(data) {
                item.isAdmin = false;
            });
        };

        
        // var MAX_NUM = 10 * 1000;
        // function rand(min, max) {
        //   return min + Math.round(Math.random() * (max-min));
        // }
        // for (var i = 0; i < MAX_NUM; ++i) {
        //   var id = rand(0, MAX_NUM);
        //   vm.items.push({
        //     name: 'Name' + id, // 字符串类型
        //     post: rand(0, 100 * 1000 * 1000), // 数字类型
        //     isCreator: id % 8 === 1 ? true:false,
        //     isAdmin: id % 9 === 2 ? true: false,
        //     summary: '这是一个测试' + i
        //   });
        // }
    }
]);