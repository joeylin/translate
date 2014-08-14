'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('newsCtrl', ['app', '$scope', '$rootScope', '$location', '$http', 'wordCount', 'setPos',
    function(app, $scope, $rootScope, $location, $http, wordCount, setPos) {
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        $scope.shareList = [];
        $scope.newShare = '';
        $scope.total = 0;
        $scope.shareCount = 0;
        $scope.change = function() {
            $scope.shareCount = wordCount($scope.newShare);
        };
        $scope.submit = function() {
            var url = '/api/share/add';
            if (!$scope.newShare) {
                return false;
            }
            if ($scope.shareCount > 140) {
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
                $scope.groupUpdate = data.groupUpdate || 0;

                if ($scope.groupUpdate > 0) {
                    $scope.showCircle = true;
                }
            });
        };
        var getMyShare = function() {
            url = '/api/user/myShare';
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.shareList = data.content;
                $scope.hasNext = data.hasNext;
                $scope.total = data.count;
                $scope.isSearch = false;
            });
        };
        var getUserList = function() {
            var url = '/api/user/userList';
            $http.get(url).success(function(data) {
                var userList = data.userList || [];
                userList.push(app.user.name);
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

        // news sidebar
        $scope.sidebar = {};
        var getSidebar = function() {
            var url = '/api/user/getSidebar';
            $http.get(url).success(function(data) {
                $scope.sidebar.weekVisit = data.weekVisit;
                $scope.sidebar.jobs = data.jobs || [];
                $scope.sidebar.connects = data.users || [];
            });
        };
        $scope.sidebar.addConnect = function(item) {
            var url = '/api/connect/send';
            $http.post(url, {
                id: item._id,
                content: ['朋友'].join(','),
                type: 'connect'
            }).success(function(data) {
                var index = $scope.sidebar.connects.indexOf(item);
                $scope.sidebar.connects.splice(index, 1);
                var url = '/api/connects/randomOne';
                $http.get(url).success(function(data) {
                    $scope.sidebar.connects.push(data.user);
                });
            });
        };
        $scope.sidebar.removeConnect = function(item) {
            var index = $scope.sidebar.connects.indexOf(item);
            $scope.sidebar.connects.splice(index, 1);
            var url = '/api/connects/randomOne';
            $http.get(url).success(function(data) {
                $scope.sidebar.connects.push(data.user);
            });
        };
        $scope.sidebar.removeJob = function(item) {
            var index = $scope.sidebar.jobs.indexOf(item);
            $scope.sidebar.jobs.splice(index, 1);
            var url = '/api/share/randomOne';
            $http.get(url).success(function(data) {
                $scope.sidebar.jobs.push(data.job);
            });
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
        $scope.vm.toggleCollect = function(share) {
            var url;
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
                    $('#' + share._id).find('.comment-editor textarea').focus();
                });
            }
        };
        $scope.vm.submitComment = function(share) {
            if (!share.newComment) {
                return false;
            }
            var url = '/api/share/comments/add';
            $http.post(url, {
                shareId: share._id,
                content: share.newComment,
                replyTo: share.user._id
            }).success(function(data) {
                var comment = {
                    user: app.user,
                    content: share.newComment,
                    _id: data.content._id,
                    date: data.content.createAt
                };
                share.comments.unshift(comment);
                share.commentsCount += 1;
                share.newComment = '';
            });
        };
        $scope.vm.deleteShare = function(share) {
            var url = '/api/share/delete';
            var data = {
                id: share._id
            };
            $http.post(url, data).success(function(data) {
                var index = $scope.shareList.indexOf(share);
                $scope.shareList.splice(index, 1);
            });
        };
        $scope.vm.delete = function(comment, share) {
            var index = share.comments.indexOf(comment);
            var url = '/api/share/comments/delete';
            $http.post(url, {
                shareId: share._id,
                commentId: comment._id
            }).success(function(data) {
                share.comments.splice(index, 1);
                share.commentsCount -= 1;
            });
        };
        $scope.vm.reply = function(comment) {
            comment.isShowReply = !comment.isShowReply;
            if (comment.isShowReply) {
                comment.newComment = '@' + comment.user.name + ' ';
                setTimeout(function() {
                    setPos($('#' + comment._id).find('textarea')[0]);
                }, 100);
            }
        };
        $scope.vm.submitInlineComment = function(comment, share) {
            if (!comment.newComment) {
                return false;
            }
            var url = '/api/share/comments/add';
            $http.post(url, {
                shareId: share._id,
                replyComment: comment._id,
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

        // fork popup
        $scope.fork = {
            open: false,
            shareCount: 0,
            share: null,
            close: function() {
                $scope.fork.open = false;
            }
        };
        $scope.fork.change = function() {
            $scope.fork.shareCount = wordCount($scope.fork.forkShare);
        };   
        $scope.fork.submit = function() {
            var url = '/api/share/fork';
            if ($scope.fork.shareCount > 140) {
                return false;
            }
            if ($scope.fork.share.isFork) {
                $http.post(url, {
                    type: 'view',
                    isFork: true,
                    forkId: $scope.fork.share._id,
                    from: {
                        share: $scope.fork.share.from.share._id,
                        user: $scope.fork.share.from.user._id,
                        group: $scope.fork.share.from.group && $scope.fork.share.from.group._id
                    },
                    content: $scope.fork.forkShare
                }).success(function(data) {
                    $scope.fork.open = false;
                    $scope.fork.share.fork += 1;
                });
            } else {
                $http.post(url, {
                    type: 'view',
                    isFork: true,
                    forkId: $scope.fork.share._id,
                    from: {
                        share: $scope.fork.share._id,
                        user: $scope.fork.share.user._id,
                        group: $scope.fork.share.group && $scope.fork.share.group._id
                    },
                    content: $scope.fork.forkShare || '转发'
                }).success(function(data) {
                    $scope.fork.open = false;
                    $scope.fork.share.fork += 1;
                });
            }
        };
        $scope.vm.forkPopup = function(share) {
            $scope.fork.open = true;
            $scope.fork.share = share;

            if (share.isFork) {
                $scope.fork.userName = share.from.user.name;
                $scope.fork.userId = share.from.user.id;
                $scope.fork.groupName = share.group && share.from.group.name;
                $scope.fork.groupId = share.group && share.from.group.id;
                $scope.fork.content = share.from.share.content;
                $scope.fork.forkShare = '//@' + share.user.name + ' ' + share.content;
            } else {
                $scope.fork.userName = share.user.name;
                $scope.fork.userId = share.user.id;
                $scope.fork.groupName =  share.group && share.group.name;
                $scope.fork.groupId = share.group && share.group.id; 
                $scope.fork.content = share.content;
                $scope.fork.date = share.createAt;
                $scope.fork.forkShare = '';
            }
            $scope.fork.change();
            setTimeout(function() {
                $('#forkText').focus();
            },200);
        };

        // for myshare search
        $scope.isSearch = false;
        $scope.vm.searchName = '';
        $scope.vm.enter = function() {
            url = '/api/user/myShare/search';
            params.keyword = $scope.vm.searchName;
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.shareList = data.content;
                $scope.hasNext = data.hasNext;
                $scope.total = data.count;
                $scope.isSearch = true;
            });
        };
        $scope.vm.getAll = function() {
            getMyShare();
        };

        // for mycollect
        var getMyCollect = function() {
            url = '/api/user/myCollect';
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.shareList = data.content;
                $scope.hasNext = data.hasNext;
                $scope.total = data.count;
                $scope.collect.isSearch = false;
            });
        };
        $scope.collect = {};
        $scope.collect.isSearch = false;
        $scope.collect.searchName = '';
        $scope.collect.enter = function() {
            url = '/api/user/myCollect/search';
            params.keyword = $scope.collect.searchName;
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.shareList = data.content;
                $scope.hasNext = data.hasNext;
                $scope.total = data.count;
                $scope.collect.isSearch = true;
            });
        };
        $scope.collect.cancel = function(share) {
            var url = '/api/user/uncollect';
            $http.post(url, {
                id: share._id
            }).success(function(data) {
                var index = $scope.shareList.indexOf(share);
                $scope.shareList.splice(index,1);
            });
        };
        $scope.collect.getAll = function() {
            getMyCollect();
        }

        // init
        if ($rootScope.current.path === 'news') {
            getTrend();
            getUserList();
            getSidebar();
        } 
        if ($rootScope.current.path === 'myShare') {
            getMyShare();
        }
        if ($rootScope.current.path === 'myCollect') {
            getMyCollect();
        }
    }
]).controller('notifyCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
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
]).controller('requestCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope', 'setPos', 
    function(app, $scope, $routeParams, $location, $http, $rootScope, setPos) {
        $scope.requests = [];

        var dispose = function() {
            $rootScope.current.request -= 1;
        };
        $scope.vm = {};
        // connect
        $scope.vm.accept = function(request) {
            var params = {
                value: true,
                requestId: request._id
            };
            var checkUrl = '/api/connect/check';
            $http.post(checkUrl, params).success(function(data) {
                request.hasDisposed = true;
                request.isPass = true;
                $rootScope.notice.connect -= 1;
            });
        };
        $scope.vm.reject = function(request) {
            var params = {
                value: false,
                requestId: request._id
            };
            var checkUrl = '/api/connect/check';
            $http.post(checkUrl, params).success(function(data) {
                request.hasDisposed = true;
                request.isPass = false;
                $rootScope.notice.connect -= 1;
            });
        };
        // group
        $scope.vm.groupAccept = function(request) {
            var params = {
                value: true,
                requestId: request._id
            };
            var checkUrl = '/api/group/checkRequest';
            $http.post(checkUrl, params).success(function(data) {
                request.hasDisposed = true;
                request.isPass = true;
                $rootScope.notice.group -= 1;
            });
        };
        $scope.vm.groupReject = function(request) {
            var params = {
                value: false,
                requestId: request._id
            };
            var checkUrl = '/api/group/checkRequest';
            $http.post(checkUrl, params).success(function(data) {
                request.hasDisposed = true;
                request.isPass = false;
                $rootScope.notice.group -= 1;
            });
        };
        // comment
        $scope.vm.toggleReply = function(request) {
            request.showReply = !request.showReply;
            if (request.showReply) {
                request.newComment = '@' + request.from.name + ' ';
                setTimeout(function() {
                    setPos($('#' + request._id).find('textarea')[0]);
                }, 100);
            }
        };
        $scope.vm.reply = function(request) {
            var comment = request.comment;
            var share = request.share;
            if (!request.newComment) {
                return false;
            }
            var url = '/api/share/comments/add';
            $http.post(url, {
                shareId: share._id,
                replyComment: request._id,
                content: request.newComment,
                replyTo: request.from._id
            }).success(function(data) {
                var $success = $('#submit-success').clone().css({display:'block'});
                $success.appendTo('#' + request._id);
                setTimeout(function() {
                    $success.remove();
                }, 500);
                request.showReply = false;
            });
        };
        $scope.vm.deleteComment = function(request) {
            var share = request.share;
            var comment = request.comment;
            var index = $scope.requests.indexOf(request);
            var url = '/api/share/comments/delete';
            $http.post(url, {
                shareId: share._id,
                commentId: request._id
            }).success(function(data) {
                $scope.requests.splice(index, 1);
                $scope.commentsCount -= 1;
            });
        };

        var url;
        if ($rootScope.current.path === 'connect') {
            url = '/api/notify/connect';
        }
        if ($rootScope.current.path === 'group') {
            url = '/api/notify/group';
        }
        if ($rootScope.current.path === 'comment') {
            url = '/api/notify/comment';
        }
        if ($rootScope.current.path === 'at') {
            url = '/api/notify/at';
        }
        if ($rootScope.current.path === 'notice') {
            url = '/api/notify/notice';
        }

        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var params = {
            page: 1
        };

        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.page = $scope.pager.current;
            getNotify();
        };
        $scope.prev = function() {
            if ($scope.pager.current <= 1) {
                return false;
            }
            $scope.pager.current -= 1;
            params.page = $scope.pager.current;
            getNotify();
        };

        var getNotify = function() {
            params.page = 1;
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.requests = data.requests;
                $rootScope.request = $rootScope.request || {};
                if ($rootScope.current.path === 'comment') {
                    $rootScope.request.comment = 0;
                }
                if ($rootScope.current.path === 'at') {
                    $rootScope.request.at = 0;
                }
            });
        };

        getNotify();
    }
]).controller('messageCtrl', ['app', '$scope', '$routeParams', '$location', '$http',
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
]).controller('peopleCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        $scope.content = [];
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        $scope.showSubmitBtn = false;
        $scope.title = '你可能认识的好友';
        var url;
        var params = {
            page: 1,
            name: $scope.name,
            location: $scope.location,
            school: $scope.school,
            company: $scope.company
        };
        $scope.submit = function() {
            url = '/api/search/people'
            params = {
                page: 1,
                name: $scope.name || undefined,
                school: $scope.school || undefined,
                company: $scope.company || undefined,
                location: $scope.location || undefined
            };
            if (!$scope.name && !$scope.school && !$scope.company && !$scope.location) {
                getMayKnowConnects();
            } else {
                getConnects();
            }
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.page = $scope.pager.current;
            getConnects();
        };
        $scope.prev = function() {
            if ($scope.pager.current === 1) {
                return false;
            }
            $scope.pager.current -= 1;
            params.page = $scope.pager.current;
            getConnects();
        };

        var getMayKnowConnects = function() {
            url = '/api/user/mayknow';
            params.page = 1;
            params.name = undefined;
            params.school = undefined;
            params.company = undefined;
            params.location = undefined;
            getConnects();
        };
        var getConnects = function() {
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };

        // connect relative
        resetRelative();
        $scope.toggleMate = function() {
            if ($scope.isClassmate) {
                var index = $scope.relative.indexOf('同学');
                $scope.relative.splice(index, 1);
            } else {
                $scope.relative.push('同学');
            }
            $scope.isClassmate = !$scope.isClassmate;
        };
        $scope.toggleFellow = function() {
            if ($scope.isFellow) {
                var index = $scope.relative.indexOf('同事');
                $scope.relative.splice(index, 1);
            } else {
                $scope.relative.push('同事');
            }
            $scope.isFellow = !$scope.isFellow;
        };
        $scope.toggleFriend = function() {
            if ($scope.isFriend) {
                var index = $scope.relative.indexOf('朋友');
                $scope.relative.splice(index, 1);
            } else {
                $scope.relative.push('朋友');
            }
            $scope.isFriend = !$scope.isFriend;
        };
        $scope.toggleInterest = function() {
            if ($scope.isInterest) {
                var index = $scope.relative.indexOf('共同爱好');
                $scope.relative.splice(index, 1);
            } else {
                $scope.relative.push('共同爱好');
            }
            $scope.isInterest = !$scope.isInterest;
        };

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

        getMayKnowConnects();
    }
]).controller('shareCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
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
]).controller('jobCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        var url = '/api/job/latest';
        $scope.content = [];
        $scope.isIntern = false;
        $scope.showBanner = true;

        $scope.payment = '';
        $scope.years = '';
        $scope.type = '';
        $scope.degree = '';
        $scope.location = '';

        $scope.pager = {
            hasNext: false,
            current: 1
        };

        $scope.vm = {};
        $scope.vm.keyword = '';
        var params = {
            page: 1,
            isIntern: $scope.isIntern,
            keyword: $scope.vm.keyword
        };
        $scope.submit = function() {
            if ($scope.vm.keyword === '') {
                return get();
            }
            url = '/api/job/latestFilter';
            params.page = 1;
            params.keyword = $scope.vm.keyword;
            $http.get(url, {
                params: params
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
            params.page = $scope.pager.current;
            get();
        };
        $scope.prev = function() {
            if ($scope.pager.current <= 1) {
                return false;
            }
            $scope.pager.current -= 1;
            params.page = $scope.pager.current;
            get();
        };
        $scope.enter = function(e, key, value) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13) {
                $scope.submit();
            }
        };
        $scope.save = function(job) {
            var url = '/api/job/save/';
            $http.post(url, {
                _id: job._id,
            }).success(function(data) {
                job.isSaved = true;
            });
        };
        $scope.getIntern = function() {
            var url = '/api/job/intern';
            params.page = 1;
            $scope.isIntern = !$scope.isIntern;
            if ($scope.isIntern) {
                $scope.internLoading = true;
                $http.get(url, {
                    params: params
                }).success(function(data) {
                    $scope.lastContent = $scope.content;
                    $scope.content = data.content;
                    $scope.pager.hasNext = data.hasNext;
                    $scope.internLoading = false;
                });  
            } else {
                if ($scope.lastContent) {
                    $scope.content = $scope.lastContent;
                }
            }               
        };  

        function get() {
            url = '/api/job/latest';
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
                $scope.isIntern = false;
            });
        }

        // default config
        $scope.payment = '';
        $scope.years = '';
        $scope.type = '';
        $scope.degree = '';
        $scope.location = '';
        get();
    }
]).controller('companyCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        $scope.content = [];
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var url = '/api/search/company';
        var params = {
            pager: 1,
            location: $scope.location,
            name: $scope.name,
            industry: $scope.industry,
            phase: $scope.phase
        };
        $scope.submit = function() {
            // reset the config before submit
            params.pager = 1;
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
            if ($scope.pager.current <= 1) {
                return false;
            }
            $scope.pager.current -= 1;
            params.pager = $scope.pager.current;
            $scope.pager.link(url, params, function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
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
        $scope.follow = function(user) {
            var url = '/api/user/follow';
            var params = {
                userId: user._id
            };
            $http.post(url, params).success(function(data) {
                user.isFollowed = true;
            });
        };

        // default config
        $scope.phase = 'all';
    }
]).controller('myCompanyCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        var url = '/api/user/companys';
        $scope.content = [];
        $scope.industry = [];
        $scope.location = [];
        $scope.name = '';
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var params = {
            pager: 1
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.pager = $scope.pager.current;
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.prev = function() {
            if ($scope.pager.current <= 1) {
                return false;
            }
            $scope.pager.current -= 1;
            params.pager = $scope.pager.current;
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.enter = function(e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13) {
                $scope.searchByName();
            }
        };
        $scope.searchByName = function() {
            if ($scope.name === '') {
                return false;
            }
            params.name = $scope.name;
            params.pager = 1;
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.vm = {};
        $scope.vm.classify = function(key, value) {
            params.type = 'classify';
            params.name = key;
            params.value = value;
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.vm.unFollow = function(company) {
            var url = '/api/user/unFollow';
            var params = {
                userId: company._id
            };
            $http.post(url, params).success(function(data) {
                var index = $scope.content.indexOf(company);
                $scope.content.splice(index, 1);
            });
        };
    }
]).controller('myPeopleCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        $scope.title = '所有好友';
        $scope.content = [];
        var url = '/api/connects';
        $scope.searchByName = function() {
            if ($scope.inputName === '') {
                return false;
            }
            var url = '/api/user/connects';
            var params = {
                name: $scope.inputName
            };
            $scope.title = '搜索 ' + $scope.inputName;
            $http.get(url, params).success(function(data) {
                $scope.content = data.content;
            });
        };

        $scope.vm = {};
        $scope.vm.page = {
            size: 28,
            index: 1
        };
        var removeUser = null;
        $scope.vm.triggerRemove = function(user, event) {
            removeUser = user;
            return false;
        };
        $scope.vm.remove = function() {
            var url = '/api/connect/disconnect';
            var params = {
                connectId: removeUser._id
            };
            $http.post(url, params).success(function(data) {
                var index = $scope.content.indexOf(removeUser);
                $scope.content.splice(index, 1);
                $.magnificPopup.close();
            });
        };
        $scope.vm.close = function() {
            removeUser = null;
            $.magnificPopup.close();
        };
        $scope.vm.getAll = getConnects;

        $scope.vm.select = function(classify, name) {
            // todo 
        };

        function getConnects() {
            var url = '/api/connects';
            $http.get(url).success(function(data) {
                $scope.content = data.content;
            });
        }

        getConnects();
    }
]).controller('myJobCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        var url = '/api/user/myjob';
        $scope.content = [];
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var params = {
            pager: 1
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
        $scope.tag = 'all';
        $scope.selectTag = function(tag) {
            $scope.tag = tag;
            if (tag === 'all') {
                params.status = undefined;
            }
            if (tag === 'publish') {
                params.status = 'publish';
            }
            if (tag === 'close') {
                params.status = 'close';
            }
            if (tag === 'draft') {
                params.status = 'draft';
            }
            get();
        };
        $scope.close = function(job) {
            var url = '/api/job/close';
            var data = {
                id: job._id
            };
            $http.post(url, data).success(function(data) {
                job.status = 'close';
            });
        };
        $scope.remove = function(job) {
            var url = '/api/job/remove';
            var data = {
                id: job._id
            };
            $http.post(url, data).success(function(data) {
                var index = $scope.content.indexOf(job);
                $scope.content.splice(index, 1);
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
        get();
    }
]).controller('mySendingCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        var url = '/api/user/sending';
        $scope.content = [];
        $scope.recommend = [];
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var params = {
            page: 1
        };
        $scope.next = function() {
            if (!$scope.pager.hasNext) {
                return false;
            }
            $scope.pager.current += 1;
            params.page = $scope.pager.current;
            get();
        };
        $scope.prev = function() {
            if ($scope.pager.current <= 1) {
                return false;
            }
            $scope.pager.current -= 1;
            params.page = $scope.pager.current;
            get();
        };
        $scope.giveUp = function(job) {
            var url = '/api/job/giveup';
            var data = {
                id: job._id
            };
            $http.post(url, data).success(function(data) {
                var index = $scope.content.indexOf(job);
                $scope.content.splice(index, 1);
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

        function getRecommend() {
            var url = '/api/user/jobrecommend';
            $http.get(url).success(function(data) {
                $scope.recommend = data.content;
            });
        }
        get();
        getRecommend();
    }
]).controller('myGroupCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        // create new group
        $scope.vm = {};
        $scope.vm.name = '';
        $scope.vm.industry = '';
        $scope.vm.reason = '';
        $scope.error = false;
        $scope.create = function() {
            if ($scope.vm.name === '' || $scope.vm.industry === '' || $scope.vm.reason === '') {
                $scope.error = true;
                return false;
            }
            var url = '/api/group/apply';
            var data = {
                name: $scope.vm.name,
                industry: $scope.vm.industry,
                reason: $scope.vm.reason
            };
            $http.post(url, data).success(function(data) {
                $.magnificPopup.close();
            });
            // $http.post(url, data).success(function(data) {
            //     $.magnificPopup.close();
            //     window.location.href = '/group/' + data.groupId + '/settings';
            // });
        };
        $scope.change = function() {
            if ($scope.vm.name !== '' && $scope.vm.industry !== '' && $scope.vm.reason !== '') {
                $scope.error = false;
            }
        };

        $scope.vm.keyword = '';
        $scope.vm.isMe = false;
        $scope.search = function() {
            var url = '/api/group/search';
            var params = {
                keyword: $scope.vm.keyword,
                isMe: $scope.vm.isMe ? true : ''
            };
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.content = data.content;
                $scope.isSearch = true;
            });
        };

        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var url = '/api/user/trend';
        var params = {
            page: 1
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

        $scope.content = [];
        var getGroup = function() {
            var url = '/api/myGroup';
            $http.get(url).success(function(data) {
                $scope.content = data.content;
                $scope.isSearch = false;
                $scope.groupCount = data.count;
            });
        };
        $scope.refresh = function() {
            getGroup();
        };

        getGroup();
    }
]).controller('groupTrendsCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope', 'wordCount', 'setPos',
    function(app, $scope, $routeParams, $location, $http, $rootScope, wordCount, setPos) {
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        $scope.shareList = [];
        $scope.total = 0;
        var url = '/api/group/trends';
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
        $scope.vm.toggleCollect = function(share) {
            var url;
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
        $scope.fork = {
            open: false,
            shareCount: 0,
            share: null,
            close: function() {
                $scope.fork.open = false;
            }
        };
        $scope.fork.change = function() {
            $scope.fork.shareCount = wordCount($scope.fork.forkShare);
        };   
        $scope.fork.submit = function() {
            var url = '/api/share/fork';
            if ($scope.fork.shareCount > 140) {
                return false;
            }
            if ($scope.fork.share.isFork) {
                $http.post(url, {
                    type: 'view',
                    isFork: true,
                    forkId: $scope.fork.share._id,
                    from: {
                        share: $scope.fork.share.from.share._id,
                        user: $scope.fork.share.from.user._id,
                        group: $scope.fork.share.from.group && $scope.fork.share.from.group._id
                    },
                    content: $scope.fork.forkShare
                }).success(function(data) {
                    $scope.fork.open = false;
                    $scope.fork.share.fork += 1;
                });
            } else {
                $http.post(url, {
                    type: 'view',
                    isFork: true,
                    forkId: $scope.fork.share._id,
                    from: {
                        share: $scope.fork.share._id,
                        user: $scope.fork.share.user._id,
                        group: $scope.fork.share.group && $scope.fork.share.group._id
                    },
                    content: $scope.fork.forkShare || '转发'
                }).success(function(data) {
                    $scope.fork.open = false;
                    $scope.fork.share.fork += 1;
                });
            }
        };
        $scope.vm.forkPopup = function(share) {
            $scope.fork.open = true;
            $scope.fork.share = share;

            if (share.isFork) {
                $scope.fork.userName = share.from.user.name;
                $scope.fork.userId = share.from.user.id;
                $scope.fork.groupName = share.group && share.from.group.name;
                $scope.fork.groupId = share.group && share.from.group.id;
                $scope.fork.content = share.from.share.content;
                $scope.fork.forkShare = '//@' + share.user.name + ' ' + share.content;
            } else {
                $scope.fork.userName = share.user.name;
                $scope.fork.userId = share.user.id;
                $scope.fork.groupName = share.group && share.group.name;
                $scope.fork.groupId = share.group && share.group.id; 
                $scope.fork.content = share.content;
                $scope.fork.date = share.createAt;
                $scope.fork.forkShare = '';
            }
            $scope.fork.change();
            setTimeout(function() {
                $('#forkText').focus();
            },200);
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
                    $('#' + share._id).find('.comment-editor textarea').focus();
                });
            }
        };
        $scope.vm.submitComment = function(share) {
            if (!share.newComment) {
                return false;
            }
            var url = '/api/share/comments/add';
            $http.post(url, {
                shareId: share._id,
                content: share.newComment,
                replyTo: share.user._id
            }).success(function(data) {
                var comment = {
                    user: app.user,
                    content: share.newComment,
                    replyTo: share.user._id,
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
                commentId: comment._id,
            }).success(function(data) {
                share.comments.splice(index, 1);
            });
        };
        $scope.vm.reply = function(comment) {
            comment.isShowReply = !comment.isShowReply;
            if (comment.isShowReply) {
                comment.newComment = '@' + comment.user.name + ' ';
                setTimeout(function() {
                    setPos($('#' + comment._id).find('textarea')[0]);
                }, 100);
            }
        };
        $scope.vm.submitInlineComment = function(comment, share) {
            if (!comment.newComment) {
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
]).controller('newJobCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        $scope.type = '全职';
        $scope.paymentStart = '';
        $scope.paymentEnd = '';
        $scope.degree = '';
        $scope.position = '';
        $scope.department = '';
        $scope.company = '';
        $scope.companyIntro = '';
        $scope.detail = '';
        $scope.location = '';
        $scope.summary = '';
        $scope.workYears = '';
        $scope.skills = '';
        $scope.contact = {};
        $scope.companyLogo = '/public/imgs/company.jpg';

        $scope.showBlankError = false;
        $scope.showNothingError = false;
        $scope.submit = function() {
            var check = $scope.type === '' || $scope.paymentStart === '' || $scope.paymentEnd === '' || $scope.degree === '' || $scope.position === '' || $scope.skills === '' || $scope.summary === '' || $scope.location === '' || $scope.company === '';
            if (check) {
                $scope.showBlankError = true;
                $scope.showNothingError = false;
                return false;
            }
            var url = '/api/share/add';
            var data = {
                type: 'job',
                status: 'publish',
                jobType: $scope.type,
                paymentStart: $scope.paymentStart,
                paymentEnd: $scope.paymentEnd,
                company: $scope.company,
                companyIntro: $scope.companyIntro,
                detail: $scope.detail,
                department: $scope.department,
                companyLogo: $scope.companyLogo,
                degree: $scope.degree,
                position: $scope.position,
                location: $scope.location,
                summary: $scope.summary,
                skills: $scope.skills,
                workYears: $scope.workYears,
                contact: {
                    qq: $scope.contact.qq,
                    phone: $scope.contact.phone,
                    email: $scope.contact.email,
                    message: $scope.contact.message
                }
            };
            $http.post(url, data).success(function(data) {
                $location.path('/job');
            });
        };
        $scope.draft = function() {
            var check = $scope.paymentStart === '' && $scope.paymentEnd === '' && $scope.degree === '' && $scope.position === '' && $scope.summary === '' && $scope.location === '';
            if (check) {
                $scope.showNothingError = true;
                $scope.showBlankError = false;
                return false;
            }
            var url = '/api/share/add';
            var data = {
                type: 'job',
                status: 'draft',
                jobType: $scope.type,
                paymentStart: $scope.paymentStart,
                paymentEnd: $scope.paymentEnd,
                degree: $scope.degree,
                position: $scope.position,
                department: $scope.department,
                company: $scope.company,
                companyLogo: $scope.companyLogo,
                companyIntro: $scope.companyIntro,
                detail: $scope.detail,
                location: $scope.location,
                summary: $scope.summary,
                skills: $scope.skills,
                workYears: $scope.workYears,
                contact: {
                    qq: $scope.contact.qq,
                    phone: $scope.contact.phone,
                    email: $scope.contact.email,
                    message: $scope.contact.message
                }
            };
            $http.post(url, data).success(function(data) {
                $location.path('/myJob');
            });
        };
        $scope.save = function() {
            var check = $scope.type === '' || $scope.paymentStart === '' || $scope.paymentEnd === '' || $scope.degree === '' || $scope.position === '' || $scope.skills === '' || $scope.summary === '' || $scope.location === '';
            if (check) {
                $scope.showBlankError = true;
                return false;
            }
            var url = '/api/share/edit';
            var data = {
                id: $scope.id,
                jobType: $scope.type,
                paymentStart: $scope.paymentStart,
                paymentEnd: $scope.paymentEnd,
                degree: $scope.degree,
                position: $scope.position,
                location: $scope.location,
                company: $scope.company,
                companyLogo: $scope.companyLogo,
                companyIntro: $scope.companyIntro,
                detail: $scope.detail,
                department: $scope.department,
                summary: $scope.summary,
                skills: $scope.skills,
                workYears: $scope.workYears,
                contact: {
                    qq: $scope.contact.qq,
                    phone: $scope.contact.phone,
                    email: $scope.contact.email,
                    message: $scope.contact.message
                }
            };
            $http.post(url, data).success(function(data) {
                $location.path('/myJob');
            });
        };
        $scope.change = function() {
            $scope.showBlankError = false;
        };

        if ($rootScope.current.path === 'editJob') {
            $scope.title = '编辑职位 ' + $routeParams.id;
            var url = '/api/job/' + $routeParams.id;
            $http.get(url).success(function(data) {
                $scope.type = data.job.type;
                $scope.paymentStart = data.job.paymentStart;
                $scope.paymentEnd = data.job.paymentEnd;
                $scope.degree = data.job.degree;
                $scope.position = data.job.position;
                $scope.department = data.job.department;
                $scope.company = data.job.company;
                $scope.companyIntro = data.job.companyIntro;
                $scope.location = data.job.location;
                $scope.summary = data.job.summary;
                $scope.detail = data.job.detail;
                $scope.workYears = data.job.workYears;
                $scope.skills = data.job.skills;
                $scope.id = data.job.id;
                $scope.contact.qq = data.contact && data.contact.qq;
                $scope.contact.email = data.contact && data.contact.email;
                $scope.contact.phone = data.contact && data.contact.phone;
                $scope.contact.message = data.contact && data.contact.message;
            });
        } else {
            $scope.title = '创建职位';
        }

        // companyLogo upload
        $scope.$on('putFinish', function(event, imageUrl) {
            $scope.$apply(function() {
                $scope.companyLogo = imageUrl;
            });
        });
    }
]);