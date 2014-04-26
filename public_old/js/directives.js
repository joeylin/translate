angular.module('jsGen.directives', ['angularFileUpload']).
directive('genParseMd', ['mdParse', 'sanitize', 'pretty', 'isVisible', '$timeout',
    function (mdParse, sanitize, pretty, isVisible, $timeout) {
        // <div gen-parse-md="document"></div>
        // document是Markdown格式或一般文档字符串，解析成DOM后插入<div>
        return function (scope, element, attr) {
            scope.$watch(attr.genParseMd, function (value) {
                if (isVisible(element)) {
                    parseDoc(value);
                } else {
                    $timeout(function () {
                        parseDoc(value);
                    }, 500);
                }
            });

            function parseDoc(value) {
                if (angular.isDefined(value)) {
                    value = mdParse(value);
                    value = sanitize(value);
                    element.html(value);
                    angular.forEach(element.find('code'), function (value) {
                        value = angular.element(value);
                        if (!value.parent().is('pre')) {
                            value.addClass('prettyline');
                        }
                    });
                    element.find('pre').addClass('prettyprint'); // linenums have bug!
                    element.find('a').attr('target', function () {
                        if (this.host !== location.host) {
                            return '_blank';
                        }
                    });
                    element.find('a').attr('href',function(i,attr) {
                        return attr.replace('.html','');
                    });
                    pretty();
                }
            }
        };
    }
]).directive('tsParseMd', ['mdParse', 'sanitize', 'pretty', 'isVisible', '$timeout',
    function (mdParse, sanitize, pretty, isVisible, $timeout) {
        // <div ts-parse-md="document"></div>
        // document是Markdown格式或一般文档字符串，解析成DOM后插入<div>
        return function (scope, element, attr) {
            scope.$watch(attr.tsParseMd, function (value) {
                if (isVisible(element)) {
                    parseDoc(value);
                } else {
                    $timeout(function () {
                        parseDoc(value);
                    }, 500);
                }
            });

            function parseDoc(value) {
                if (!angular.isDefined(value)) {
                    return;
                }
                var mdContent = '';
                value.map(function(section,key) {
                    mdContent += section.md + '\n\n';
                });
                var content = sanitize(mdParse(mdContent));
                element.html(content);
                angular.forEach(element.find('code'), function (value) {
                    value = angular.element(value);
                    if (!value.parent().is('pre')) {
                        value.addClass('prettyline');
                    }
                });
                element.find('pre').addClass('prettyprint'); // linenums have bug!
                element.find('a').attr('target', function () {
                    if (this.host !== location.host) {
                        return '_blank';
                    }
                });
                pretty();
            }
        };
    }
]);