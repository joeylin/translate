angular.module('jsGen.directives', []).
directive('genParseMd', ['mdParse', 'sanitize', 'pretty', 'isVisible', '$timeout',
    function(mdParse, sanitize, pretty, isVisible, $timeout) {
        // <div gen-parse-md="document"></div>
        // document是Markdown格式或一般文档字符串，解析成DOM后插入<div>
        return function(scope, element, attr) {
            scope.$watch(attr.genParseMd, function(value) {
                if (isVisible(element)) {
                    parseDoc(value);
                } else {
                    $timeout(function() {
                        parseDoc(value);
                    }, 500);
                }
            });

            function parseDoc(value) {
                if (angular.isDefined(value)) {
                    value = mdParse(value);
                    value = sanitize(value);
                    element.html(value);
                    angular.forEach(element.find('code'), function(value) {
                        value = angular.element(value);
                        if (!value.parent().is('pre')) {
                            value.addClass('prettyline');
                        }
                    });
                    element.find('pre').addClass('prettyprint'); // linenums have bug!
                    element.find('a').attr('target', function() {
                        if (this.host !== location.host) {
                            return '_blank';
                        }
                    });
                    element.find('a').attr('href', function(i, attr) {
                        return attr.replace('.html', '');
                    });
                    pretty();
                }
            }
        };
    }
]).directive('tsParseMd', ['mdParse', 'sanitize', 'pretty', 'isVisible', '$timeout',
    function(mdParse, sanitize, pretty, isVisible, $timeout) {
        // <div ts-parse-md="document"></div>
        // document是Markdown格式或一般文档字符串，解析成DOM后插入<div>
        return function(scope, element, attr) {
            scope.$watch(attr.tsParseMd, function(value) {
                if (isVisible(element)) {
                    parseDoc(value);
                } else {
                    $timeout(function() {
                        parseDoc(value);
                    }, 500);
                }
            });

            function parseDoc(value) {
                if (!angular.isDefined(value)) {
                    return;
                }
                var mdContent = '';
                value.map(function(section, key) {
                    mdContent += section.md + '\n\n';
                });
                var content = sanitize(mdParse(mdContent));
                element.html(content);
                angular.forEach(element.find('code'), function(value) {
                    value = angular.element(value);
                    if (!value.parent().is('pre')) {
                        value.addClass('prettyline');
                    }
                });
                element.find('pre').addClass('prettyprint'); // linenums have bug!
                element.find('a').attr('target', function() {
                    if (this.host !== location.host) {
                        return '_blank';
                    }
                });
                pretty();
            }
        };
    }
]).directive('tocParse', ['mdParse', 'sanitize', 'pretty', 'isVisible', '$timeout',
    function(mdParse, sanitize, pretty, isVisible, $timeout) {
        // <div toc-parse="document"></div>
        // document是Markdown格式或一般文档字符串，解析成DOM后插入<div>
        return function(scope, element, attr) {
            scope.$watch(attr.tocParse, function(value) {
                if (isVisible(element)) {
                    parseDoc(value);
                } else {
                    $timeout(function() {
                        parseDoc(value);
                    }, 500);
                }
            });

            function parseDoc(value) {
                if (!angular.isDefined(value)) {
                    return;
                }
                var content = sanitize(mdParse(value));
                var result = angular.element(content);
                result.addClass(attr.attachClass);
                element.html(result);
            }
        };
    }
]).directive('validateWatch', [

    function() {
        return {
            require: 'ngModel',
            link: function(scope, ele, attrs, ctrl) {
                if (attrs.validateWatch) {
                    var repeatValidator = function(value) {
                        return validate(ctrl, 'repeat', value === scope.$eval(attrs.validateWatch), value);
                    };
                    ctrl.$parsers.push(repeatValidator);
                    ctrl.$formatters.push(repeatValidator);
                }

                function validate(ctrl, validatorName, validity, value) {
                    ctrl.$setValidity(validatorName, validity);
                    return validity ? value : undefined;
                }

            }
        };
    }
]).directive('tsOrigin', ['mdParse', 'sanitize', 'pretty', 'isVisible', '$timeout',
    function(mdParse, sanitize, pretty, isVisible, $timeout) {
        // <div ts-origin="document"></div>
        // document是Markdown格式或一般文档字符串，解析成DOM后插入<div>
        return function(scope, element, attr) {
            var value = scope.$eval(attr.tsOrigin);
            parseDoc(value);

            function parseDoc(value) {
                if (!angular.isDefined(value)) {
                    return;
                }
                var mdContent = '';
                value.map(function(section, key) {
                    if (section.translate && section.translate.content) {
                        mdContent += section.translate.content + '\n\n';
                    } else {
                        mdContent += section.md + '\n\n';
                    }

                });
                var content = sanitize(mdParse(mdContent));
                element.html(content);
                angular.forEach(element.find('code'), function(value) {
                    value = angular.element(value);
                    if (!value.parent().is('pre')) {
                        value.addClass('prettyline');
                    }
                });
                element.find('pre').addClass('prettyprint'); // linenums have bug!
                element.find('a').attr('target', function() {
                    if (this.host !== location.host) {
                        return '_blank';
                    }
                });
                pretty();
            }
        };
    }
]).directive('ueditor', ['mdParse', 'sanitize', 'pretty', 'isVisible', '$timeout',
    function(mdParse, sanitize, pretty, isVisible, $timeout) {
        return {
            restrict: 'AE',
            transclude: true,
            replace: true,
            template: '<script name="content" type="text/plain" ng-transclude></script>',
            require: '?ngModel',
            scope: {
                config: '='
            },
            link: function(scope, element, attrs, ngModel) {
                var editor = new UE.ui.Editor(scope.config || {});
                editor.render(element[0]);
                if (ngModel) {
                    //Model数据更新时，更新百度UEditor
                    ngModel.$render = function() {
                        try {
                            editor.setContent(ngModel.$viewValue);
                        } catch (e) {

                        }
                    };
                    //百度UEditor数据更新时，更新Model
                    editor.addListener('contentChange', function() {
                        setTimeout(function() {
                            scope.$apply(function() {
                                ngModel.$setViewValue(editor.getContent());
                            });
                        }, 0);
                    });
                }
            }
        };
    }
]).directive('popup', ['mdParse', 'sanitize', 'pretty', 'isVisible', '$timeout',
    function(mdParse, sanitize, pretty, isVisible, $timeout) {
        return {
            restrict: 'AE',
            link: function(scope, element, attrs, ngModel) {
                $(element).magnificPopup({
                    type: 'inline',
                    closeOnBgClick: false,
                    midClick: true
                });
            }
        };
    }
]).directive('atwho', ['mdParse', 'sanitize', 'pretty', 'isVisible', '$timeout',
    function(mdParse, sanitize, pretty, isVisible, $timeout) {
        return {
            restrict: 'AE',
            link: function(scope, element, attrs, ngModel) {
                scope.$watch(attrs.wholist, function(value) {
                    $(element).atwho({
                        at: '@',
                        data: value
                    });
                });
            }
        };
    }
]);