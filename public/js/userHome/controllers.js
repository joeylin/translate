'use strict';
/*global angular*/

angular.module('jsGen.controllers', ['ui.validate']).
controller('newsCtrl', ['app', '$scope', '$rootScope', '$location', '$http',
    function(app, $scope, $rootScope, $location, $http) {
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
]).controller('requestCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        $scope.requests = [];
        var checkUrl = '/api/connect/check';
        var dispose = function() {
            $rootScope.current.request -= 1;
        };
        $scope.vm = {};
        $scope.vm.accept = function(request) {
            var params = {
                value: true,
                requestId: request._id
            };
            $http.post(checkUrl, params).success(function(data) {
                request.hasDisposed = true;
                dispose();
            });
        };
        $scope.vm.reject = function(request) {
            var params = {
                value: false,
                requestId: request._id
            };
            $http.post(checkUrl, params).success(function(data) {
                request.hasDisposed = true;
                dispose();
            });
        };
        var url = '/api/notify/request';
        $http.get(url).success(function(data) {
            $scope.requests = data.requests;
        });
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
        $scope.name = '';
        $scope.keyword = '';
        $scope.content = [];
        $scope.isFilter = false;
        var url = '/api/search/people';
        var params = {
            pager: 0,
            name: $scope.name,
            keyword: $scope.keyword
        };
        $scope.submit = function() {
            // reset the config before submit
            var params = {
                pager: 0,
                name: $scope.name,
                keyword: $scope.keyword
            };
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
            });
        };
        $scope.next = function() {
            if (!$scope.vm.pager.hasNext) {
                return false;
            }
            $scope.vm.pager.current += 1;
            params.pager = $scope.vm.pager.current;
            $scope.vm.pager.link(url, params, function(data) {
                $scope.content = data.content;
                $scope.vm.pager.hasNext = data.hasNext;
            });
        };
        $scope.prev = function() {
            if (!$scope.vm.pager.current) {
                return false;
            }
            $scope.vm.pager.current -= 1;
            params.pager = $scope.vm.pager.current;
            $scope.vm.pager.link(url, params, function(data) {
                $scope.content = data.content;
                $scope.vm.pager.hasNext = data.hasNext;
            });
        };
        $scope.showFilter = function() {
            $scope.isFilter = true;
        };
        $scope.hideFilter = function() {
            $scope.isFilter = false;
        };
        var addFilter = function(key, value) {
            params[key] = value;
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.content = data.content;
                $scope.vm.pager.hasNext = data.hasNext;
            });
        };
        $scope.addFilter = addFilter;
        $scope.enter = function(e, key, value) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13) {
                addFilter(key, value);
            }
        };
        $scope.connect = function(user) {
            var url = '/api/connect/send';
            $http.post(url, {
                id: user._id,
                type: 'connect'
            }).success(function(data) {
                user.isConnected = true;
            });
        };

        // default config
        $scope.years = '0-2';
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
        var url = '/api/search/jobs';
        $scope.content = [];
        $scope.pager = {
            hasNext: false,
            current: 1
        };
        var params = {
            pager: 1,
            payment: $scope.payment,
            degree: $scope.degree,
            years: $scope.years,
            type: $scope.type,
            location: $scope.location,
            keyword: $scope.keyword
        };
        $scope.submit = function() {
            // reset the config before submit
            params.pager = 1;
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
            if ($scope.pager.current <= 1) {
                return false;
            }
            $scope.pager.current -= 1;
            params.pager = $scope.pager.current;
            get();
        };
        var addFilter = function(key, value) {
            params[key] = value;
            params.pager = 0;
            get();
        };
        $scope.addFilter = addFilter;
        $scope.enter = function(e, key, value) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13) {
                addFilter(key, value);
            }
        };
        $scope.save = function(job) {
            var url = '/api/job/save/';
            $http.post(url, {
                _id: job._id,
            }).success(function(data) {

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

        // default config
        $scope.years = 'noLimit';
        $scope.degree = 'noLimit';
        $scope.payment = 'all';
        $scope.type = 'all';
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
        $scope.title = 'All Connects';
        $scope.relations = [];
        $scope.postions = [];
        $scope.content = [];

        $scope.searchByName = function() {
            if ($scope.inputName === '') {
                return false;
            }
            var url = '/api/user/connects';
            var params = {
                name: $scope.inputName
            };
            $scope.title = 'Search By ' + $scope.inputName;
            $http.get(url, params).success(function(data) {
                $scope.content = data.content;
            });
        };

        $scope.vm = {};
        $scope.vm.select = function(item) {
            var url = '/api/user/connects';
            var params = {
                filter: item.name
            };
            $scope.title = item.name;
            $http(url, params).success(function(data) {
                $scope.content = data.content;
            });
        };
        $scope.vm.remove = function(connect) {
            var url = '/api/user/disconnect';
            var params = {
                connectId: connect._id
            };
            $http.post(url, params).success(function(data) {
                var index = $scope.content.indexOf(connect);
                $scope.connect.splice(index, 1);
            });
        };
    }
]).controller('myShareCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        $scope.keyword = '';
        $scope.content = [];
        var url = '/api/user/share';
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
            if (!$scope.vm.pager.hasLast) {
                return false;
            }
            $scope.vm.pager.current += 1;
            params.pager = $scope.vm.pager.current;
            get();
        };
        $scope.prev = function() {
            if (!$scope.vm.pager.current) {
                return false;
            }
            $scope.vm.pager.current -= 1;
            params.pager = $scope.vm.pager.current;
            get();
        };

        function get() {
            $http.get(url, {
                params: params,
            }).success(function(data) {
                $scope.content = data.content;
                $scope.vm.pager.hasLast = data.hasLast;
            });
        }
        get();
    }
]).controller('myJobCtrl', ['app', '$scope', '$routeParams', '$location', '$http', '$rootScope',
    function(app, $scope, $routeParams, $location, $http, $rootScope) {
        var url = '/api/user/collects';
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

        function get() {
            $http.get(url, {
                params: params
            }).success(function(data) {
                $scope.content = data.content;
                $scope.pager.hasNext = data.hasNext;
                setTimeout(function() {
                    $('.tsTooltip').tsTooltip();
                }, 16);
            });
        }
        get();
        // just for example
        $('.tsTooltip').tsTooltip();
    }
]);