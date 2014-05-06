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
]).directive('shake', [

    function() {
        return {
            link: function(scope, ele, attrs) {
                scope.$on('shake', function() {
                    shake(ele, 4, 6, 700, '#CC2222');
                });

                function shake(element, intShakes, intDistance, intDuration, foreColor) {
                    $(element).each(function() {
                        if (foreColor && foreColor != "null") {
                            $(this).css("color", foreColor);
                        }
                        $(this).css("position", "relative");
                        for (var x = 1; x <= intShakes; x++) {
                            $(this).animate({
                                left: (intDistance * -1)
                            }, (((intDuration / intShakes) / 4)))
                                .animate({
                                    left: intDistance
                                }, ((intDuration / intShakes) / 2))
                                .animate({
                                    left: 0
                                }, (((intDuration / intShakes) / 4)));
                            $(this).css("color", "");
                        }
                    });
                };
            }
        };
    }
]);