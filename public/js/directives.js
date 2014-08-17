angular.module('jsGen.directives', []).
directive('popup', ['mdParse', 'sanitize', 'pretty', 'isVisible', '$timeout',
    function(mdParse, sanitize, pretty, isVisible, $timeout) {
        return {
            restrict: 'AE',
            link: function(scope, element, attrs, ngModel) {
                setTimeout(function() {
                    $(element).magnificPopup({
                        type: 'inline',
                        closeOnBgClick: false,
                        midClick: true
                    });
                }, 300);
            }
        };
    }
]).directive('atwho', ['mdParse', 'sanitize', 'pretty', 'isVisible', '$timeout',
    function(mdParse, sanitize, pretty, isVisible, $timeout) {
        return {
            restrict: 'AE',
            link: function(scope, element, attrs, ngModel) {
                scope.$watch(attrs.atwho, function(value) {
                    $(element).atwho({
                        at: '@',
                        data: value
                    });
                });
            }
        };
    }
]).directive('autoHeight', ['mdParse', 'sanitize', 'pretty', 'isVisible', '$timeout',
    function(mdParse, sanitize, pretty, isVisible, $timeout) {
        return {
            restrict: 'AE',
            link: function(scope, element, attrs) {
                if (!$(element).is('textarea')) {
                    return false;
                }
                $(element).flexText();
            }
        };
    }
]).directive('autoCut', ['mdParse', 'wordCount', 'pretty', 'isVisible', '$timeout',
    function(mdParse, wordCount, pretty, isVisible, $timeout) {
        return {
            restrict: 'AE',
            link: function(scope, element, attrs) {
                if (!$(element).is('textarea')) {
                    return false;
                }
                var a = $(element)[0];
                a.onpropertychange = obj;
                a.oninput = obj; 
                function obj(){
                    if(a.value.length > 280){
                        var str = a.value.substring(0, 280);
                        a.value = str;
                    }
                }
            }
        };
    }
]).directive('mdContent', ['mdParse', 'sanitize', 'pretty', 'isVisible', '$timeout',
    function(mdParse, sanitize, pretty, isVisible, $timeout) {
        return function(scope, element, attr) {
            var value = scope.$eval(attr.mdContent);
            parseDoc(value);

            function parseDoc(value) {
                if (!angular.isDefined(value)) {
                    return;
                }
                var content = sanitize(mdParse(value));
                var replaceContent = content.replace(/\B@\w*\b/g, '<span class="at">$&</span>');
                var html = angular.element(replaceContent);
                var tags = html.find('a').attr('target','_blank');
                angular.forEach(tags, function(tag, key) {
                    var $tag = $(tag);
                    $tag.text(substr($tag.text()));
                });
                var result = html.html();
                element.html(result);

                function substr(string) {
                    if (string.length > 20) {
                        var str = string.slice(0,19);
                        return str + '...';
                    } else {
                        return string;
                    }
                }
            }
        };
    }
]).directive('relselect', ['mdParse', 'sanitize', 'pretty', 'isVisible', '$http',
    function(mdParse, sanitize, pretty, isVisible, $http) {
        return {
            restrict: 'AE',
            scope: {
                user: '='
            },
            link: function($scope, element, attrs) {
                $(element).css({
                    position: 'relative',
                    display: 'inline-block'
                });
                var relates = [];
                var $template;
                var optionClick = function() {
                    var $this = $(this);
                    var $icon = $this.find('i');
                    if ($icon.hasClass('fa-circle-o')) {
                        $icon.removeClass('fa-circle-o').addClass('fa-check-circle-o');
                        relates.push($this.data('value'));
                        $template.find('.error').css({
                            display: 'none'
                        });
                    } else {
                        $icon.removeClass('fa-check-circle-o').addClass('fa-circle-o');
                        relates.splice(relates.indexOf($this.data('value')), 1);
                    }
                    return false;
                };
                var close = function() {
                    relates = [];
                    $template.find('.relative-option i')
                        .removeClass('fa-check-circle-o')
                        .addClass('fa-circle-o');
                    $template.find('.relative-option').off('click');
                    $template.find('.enter').off('click');
                    $(document).off('click.relselect');
                };
                $template = $('#change-select');
                $(element).on('click', function(e) {
                    if ($template.hasClass('isOpened')) {
                        $template.removeClass('isOpened');
                        close();
                    } else {
                        close();
                        $template.addClass('isOpened');
                        $template.find('.relative-option').on('click', optionClick);
                        $template.find('.enter').on('click', function() {
                            var url = '/api/connect/relate';
                            if (relates.length === 0) {
                                $template.find('.error').css({
                                    display: 'block'
                                });
                                return false;
                            }
                            var data = {
                                content: relates.join(','),
                                userId: $scope.user._id
                            };
                            $http.post(url, data).success(function() {
                                $scope.user.relate = relates.join(',');
                                $template.removeClass('isOpened');
                                close();
                            });
                            return false;
                        });
                        $(document).on('click.relselect', function() {
                            $template.removeClass('isOpened');
                            close();
                        });
                        position($(element));
                    }
                    return false;
                });
                $template.on('click', function() {
                    return false;
                });

                var position = function($element) {
                    var offset = $element.offset(),
                        height = $element.outerHeight(),
                        width = $element.outerWidth(),
                        picker_width = $template.outerWidth(true),
                        picker_height = $template.outerHeight(true),
                        top, left;

                    top = offset.top + height;
                    left = offset.left + (width - picker_width) / 2;

                    $template.css({
                        position: 'fixed',
                        top: top,
                        left: left
                    });
                };
            }
        };
    }
]).directive('dropdown', ['mdParse', 'sanitize', 'pretty', 'isVisible', '$http',
    function(mdParse, sanitize, pretty, isVisible, $http) {
        return {
            restrict: 'AE',
            scope: {
                open: '&',
                close: '&'
            },
            link: function($scope, element, attrs) {
                if (!$(element).find('.dropdown-toggle')) {
                    return false;
                }
                $(element).on('show.bs.dropdown', function() {
                    if (typeof $scope.open == 'function') {
                        $scope.open();
                    }
                });
                $(element).on('hide.bs.dropdown', function() {
                    if (typeof $scope.close == 'function') {
                        $scope.close();
                    }
                });
            }
        };
    }
]).directive('addHtml', ['mdParse', 'sanitize', 'pretty', 'isVisible', '$http',
    function(mdParse, sanitize, pretty, isVisible, $http) {
        return {
            restrict: 'AE',
            link: function($scope, element, attrs) {
                var value = $scope.$eval(attrs.addHtml);
                var content = sanitize(value);
                element.html(content).find('a').attr('target','_self');
            }
        };
    }
]);