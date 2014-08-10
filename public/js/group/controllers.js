'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate', 'ui.bootstrap.pagination']).
controller('topicCtrl', ['app', '$scope', '$rootScope', '$location', '$http', 'wordCount',
    function(app, $scope, $rootScope, $location, $http, wordCount) {
        $scope.isOpened = false;
        $scope.isSearch = false;
        $scope.keyword = '';
        $scope.shareCount = 0;
        $scope.toMyShare = false;
        $scope.open = function() {
            if (!app.author) {
                return $scope.$emit('popup', 'login');
            }
            if (!app.isJoined) {
                return $scope.$emit('popup', 'join');
            }
            $scope.isOpened = !$scope.isOpened;
        };
        $scope.change = function(value) {
            $scope.shareCount = wordCount(value);
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
            if ($scope.shareCount > 140) {
                return false;
            }
            $http.post(url, {
                type: 'group',
                toMyShare: $scope.toMyShare || '',
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
            if (!app.author) {
                return false;
            }
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
        $scope.vm.toggleCollect = function(share) {
            var url;
            if (!app.author) {
                return false;
            }
            if (share.has_collect) {
                url = '/api/user/uncollect';
                $http.post(url, {
                    id: share._id
                }).success(function(data) {
                    share.has_collect = false;
                });
            } else {
                url = '/api/user/collect';
                $http.post(url, {
                    id: share._id
                }).success(function(data) {
                    share.has_collect = true;
                });
            }
        };
        $scope.vm.forkPopup = function(share) {
            if (!app.author) {
                return false;
            }
            var forkObj = {
                change: $scope.change,
                share: share
            };
            $scope.$emit('popup', 'fork', forkObj);
        };
        $scope.vm.toggleComment = function(share) {
            if (!app.author) {
                return false;
            }
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
            if (!app.author) {
                return false;
            }
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
                share.commentsCount += 1;
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
                share.commentsCount -= 1;
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
        $scope.basic.intro = app.group.intro;

        $scope.clickMember = function() {
            if ($scope.current === 'm') {
                return false;
            } else {
                $scope.current = 'm';
                getMembers();
            }
        };
        $scope.clickHire = function() {
            if ($scope.current === 'h') {
                return false;
            } else {
                $scope.current = 'h';
                getHire();
            }
        };
        $scope.clickCode = function() {
            if ($scope.current === 'c') {
                return false;
            } else {
                $scope.current = 'c';
                getCode();
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
                announcement: $scope.basic.announcement,
                intro: $scope.basic.intro
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
            label: '用户名',
            name: 'name',
            type: 'string'
        }, {
            label: '发文数',
            name: 'post',
            type: 'number'
        }, {
            label: '管理',
            name: 'actions',
            sortable: false
        }];

        // hire
        $scope.hires = [];
        $scope.hire = {};
        $scope.vm.openHire = function() {
            if ($scope.hires.length >= 5) {
                clearTimeout(timer);
                $('#maxLimit').css({display:'inline-block'});
                var timer = setTimeout(function() {
                    $('#maxLimit').css({display:'none'});
                }, 500);
                return false;
            }
            $scope.hire.location = '';
            $scope.hire.position = '';
            $scope.hire.link = '';
            $scope.showAddHire = true;
        };
        $scope.vm.hireCancel = function() {
            $scope.showAddHire = false;
        };
        $scope.vm.addHire = function() {
            var url = '/api/group/addHire';
            if ($scope.hires.length >= 5) {
                return false;
            }
            var data = {
                id: app.group.id,
                location: $scope.hire.location,
                position: $scope.hire.position,
                link: $scope.hire.link,
                by: app.author._id
            };
            $http.post(url, data).success(function(result) {
                $scope.showAddHire = false;
                $scope.hires.push({
                    location: data.location,
                    position: data.position,
                    link: data.link,
                    by: {
                        name: app.author.name,
                        id: app.author.id
                    }
                });
            });
        };
        $scope.vm.delHire = function(item) {
            var url = '/api/group/delHire';
            var data = {
                id: app.group.id,
                location: item.location,
                position: item.position,
                link: item.link
            };
            $http.post(url, data).success(function(result) {
                var index = $scope.hires.indexOf(item);
                $scope.hires.splice(index, 1);
            });
        };

        // invitation code
        $scope.code = {};
        $scope.code.unUsed = [];
        $scope.generateCode = function() {
            var url = '/api/group/generateCode';
            var data = {
                type: 'group',
                id: app.group.id
            };
            $http.post(url, data).success(function(data) {
                if (data.msg === 1) {
                    clearTimeout(timer);
                    $('#maxCode').css({display: 'inline-block'});
                    var timer = setTimeout(function() {
                        $('#maxCode').css({display: 'none'});
                    }, 500);
                    return false;
                }
                $scope.code.unUsed.push({
                    code: data.inviteCode
                });
            });
        };

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
        function getHire() {
            var url = '/api/group/getHire';
            var params = {
                id: app.group.id
            };
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.hires = data.hire;
            });
        }
        function getCode() {
            var url = '/api/group/getGroupCode';
            var params = {
                id: app.group.id
            };
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.code.total = data.total;
                $scope.code.used = data.used;
                $scope.code.unUsed = data.unUsed || [];
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