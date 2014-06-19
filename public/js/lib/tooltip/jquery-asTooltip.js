/*! jQuery asTooltip - v0.2.0 - 2014-06-11
 * https://github.com/amazingSurge/jquery-asTooltip
 * Copyright (c) 2014 amazingSurge; Licensed GPL */
(function($) {
    "use strict";

    var $win = $(window);
    var active = false;
    var dataPool = [];

    var POSITION = 'nswe';
    var resovolution = {
        n: {
            n: 's',
            w: 'ne',
            e: 'nw'
        },
        s: {
            s: 'n',
            w: 'se',
            e: 'sw'
        },
        w: {
            w: 'e',
            n: 'sw',
            s: 'nw'
        },
        e: {
            e: 'w',
            n: 'se',
            s: 'ne'
        },
        nw: {
            n: 'sw',
            w: 'ne'
        },
        ne: {
            n: 'se',
            e: 'nw'
        },
        sw: {
            s: 'nw',
            w: 'se'
        },
        se: {
            s: 'ne',
            e: 'sw'
        }
    };

    // this is the core function to compute the position to show depended on the given placement argument 
    function computePlacementCoords(element, placement, popWidth, popHeight, popSpace, onCursor) {
        // grab measurements
        var objectOffset, objectWidth, objectHeight,
            x = 0,
            y = 0;

        if (onCursor) {
            objectOffset = element;
            objectWidth = 0;
            objectHeight = 0;
        } else {
            objectOffset = element.offset();
            objectWidth = element.outerWidth();
            objectHeight = element.outerHeight();
        }


        // calculate the appropriate x and y position in the document
        switch (placement) {
            case 'n':
                x = (objectOffset.left + (objectWidth / 2)) - (popWidth / 2);
                y = objectOffset.top - popHeight - popSpace;
                break;
            case 'e':
                x = objectOffset.left + objectWidth + popSpace;
                y = (objectOffset.top + (objectHeight / 2)) - (popHeight / 2);
                break;
            case 's':
                x = (objectOffset.left + (objectWidth / 2)) - (popWidth / 2);
                y = objectOffset.top + objectHeight + popSpace;
                break;
            case 'w':
                x = objectOffset.left - popWidth - popSpace;
                y = (objectOffset.top + (objectHeight / 2)) - (popHeight / 2);
                break;
            case 'nw':
            case 'wn':
                x = (objectOffset.left - popWidth) + 30;
                y = objectOffset.top - popHeight - popSpace;
                break;
            case 'ne':
            case 'en':
                x = (objectOffset.left + objectWidth) - 30;
                y = objectOffset.top - popHeight - popSpace;
                break;
            case 'sw':
            case 'ws':
                x = (objectOffset.left - popWidth) + 30;
                y = objectOffset.top + objectHeight + popSpace;
                break;
            case 'se':
            case 'es':
                x = (objectOffset.left + objectWidth) - 30;
                y = objectOffset.top + objectHeight + popSpace;
                break;
        }

        return {
            left: Math.round(x),
            top: Math.round(y)
        };
    }

    function getViewportCollisions($target, popElem) {
        var scrollLeft = $win.scrollLeft(),
            scrollTop = $win.scrollTop(),
            offset = $target.offset(),
            elementWidth = $target.outerWidth(true),
            elementHeight = $target.outerHeight(true),
            windowWidth = $win.width(),
            windowHeight = $win.height(),
            collisions = [],
            popWidth, popHeight;

        if (popElem) {
            popWidth = popElem.outerWidth(true);
            popHeight = popElem.outerHeight(true);
        } else {
            // for loading animation icon placeholder
            popWidth = 100;
            popHeight = 50;
        }

        if (offset.top < scrollTop + popHeight) {
            collisions.push('n');
        }
        if (offset.top + elementHeight + popHeight > scrollTop + windowHeight) {
            collisions.push('s');
        }
        if (offset.left < scrollLeft + popWidth) {
            collisions.push('w');
        }
        if (offset.left + elementWidth + popWidth > scrollLeft + windowWidth) {
            collisions.push('e');
        }

        return collisions;
    }

    // Static method.
    var AsTooltip = $.asTooltip = function(element, options) {
        this.$element = $(element);

        this.options = $.extend({}, AsTooltip.defaults, options, this.$element.data());
        this.namespace = this.options.namespace;

        this.content = null;
        this.$target = this.$element;

        this.isOpen = false;
        this.enabled = true;
        this.tolerance = null;

        this.onlyOne = this.options.onlyOne;
        this._trigger('init');
        this.init();
    };

    AsTooltip.prototype = {
        constructor: AsTooltip,
        init: function() {
            // add namespace
            var tpl = this.parseTpl(this.options.tpl);

            this.$container = $(tpl.container);
            this.$loading = $(tpl.loading);
            this.$arrow = $(tpl.arrow);
            this.$close = $(tpl.close);
            this.$content = $(tpl.content);

            if (this.options.trigger === 'hover') {
                this.$target.on('mouseenter.asTooltip', this.options.selector, $.proxy(this.enter, this));
                this.$target.on('mouseleave.asTooltip', this.options.selector, $.proxy(this.leave, this));

                if (this.options.mouseTrace === true) {
                    this.$target.on('mousemove.asTooltip', this.options.selector, $.proxy(this.move, this));
                }
            }
            if (this.options.trigger === 'click') {
                this.$target.on('click.asTooltip', this.options.selector, $.proxy(this.toggle, this));
            }

            if (this.options.selector) {
                this._options = $.extend({}, this.options, {
                    trigger: 'manual',
                    selector: ''
                });
            } else {
                this.fixTitle();
            }

            //store all instance in dataPool
            dataPool.push(this);
            this._trigger('ready');
        },
        getDelegateOptions: function() {
            var options = {};
            this._options && $.each(this._options, function(key, value) {
                if (AsTooltip.defaults[key] !== value) {
                    options[key] = value;
                }
            });

            return options;
        },
        fixTitle: function() {
            if (this.$element.attr('title')) {
                this.options.title = this.$element.attr('title');
                this.$element.removeAttr('title');
            }
        },
        enter: function(obj) {
            var self = obj instanceof this.constructor ?
                obj : $(obj.currentTarget).data('asTooltip');

            if (!self) {
                self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
                $(obj.currentTarget).data('asTooltip', self);
            }

            if (self.isOpen === true) {
                clearTimeout(self.tolerance);
                return;
            } else {
                $.proxy(self.show, self)();
            }
        },
        leave: function(obj) {
            var self = obj instanceof this.constructor ?
                obj : $(obj.currentTarget).data('asTooltip');

            if (!self) {
                self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
                $(obj.currentTarget).data('asTooltip', self);
            }


            if (self.options.interactive === true) {
                var keepShow = false;

                self.$container.on('mouseenter.asTooltip', function() {
                    keepShow = true;
                });
                self.$container.on('mouseleave.asTooltip', function() {
                    keepShow = false;
                });

                clearTimeout(self.tolerance);

                self.tolerance = setTimeout(function() {
                    if (keepShow === true) {
                        self.$container.on('mouseleave.asTooltip', $.proxy(self.hide, self));
                    } else {
                        $.proxy(self.hide, self)();
                    }
                }, self.options.interactiveDelay);
            } else {
                $.proxy(self.hide, self)();
            }
        },
        toggle: function(obj) {
            var self = obj instanceof this.constructor ?
                obj : $(obj.currentTarget).data('asTooltip');

            if (!self) {
                self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
                $(obj.currentTarget).data('asTooltip', self);
            }

            if (self.isOpen === true) {
                $.proxy(self.hide, self)();
            } else {
                $.proxy(self.show, self)();
            }
        },
        move: function(obj) {
            var pos, cursor = {},
                x = obj.pageX,
                y = obj.pageY;

            var self = obj instanceof this.constructor ?
                obj : $(obj.currentTarget).data('asTooltip');

            if (!self) {
                self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
                $(obj.currentTarget).data('asTooltip', self);
            }

            cursor = {
                top: y,
                left: x
            };

            pos = computePlacementCoords(cursor, self.options.position, self.width, self.height, self.options.popSpace, true);

            self.$container.css({
                display: 'block',
                top: pos.top,
                left: pos.left
            });
        },
        load: function() {
            var self = this,
                opts = this.options;

            // when ajax content add to container , recompulate the position again
            if (opts.ajax === true) {
                $.ajax($.extend({}, opts.ajaxSettings, {
                    url: opts.title,
                    type: 'get',
                    error: function() {
                        throw new Error('ajax error');
                    },
                    success: function(json, status) {
                        var data = JSON.parse(json);
                        if (data.code === 200) {
                            self.content = opts.ajaxParse(data.content);
                            self.$container.css({
                                display: 'none'
                            });
                            self.$content.empty().append(self.content);
                            self.$container.removeClass(self.posCss);
                            self.setPosition();
                        }
                    }
                }));
            } else if (opts.inline === true) {
                if (opts.title.indexOf('+') !== -1) {
                    this.content = this.$element.next().css({
                        display: 'block'
                    });
                } else {
                    this.content = $(opts.title).css({
                        display: 'block'
                    });
                }
            } else {
                this.content = opts.title;
            }
        },
        parseTpl: function(obj) {
            var tpl = {},
                self = this;
            $.each(obj, function(key, value) {
                tpl[key] = value.replace('{{namespace}}', self.namespace);
            });

            return tpl;
        },
        showLoading: function() {
            this.$content.empty();
            this.$loading.css({
                display: 'block'
            });
        },
        hideLoading: function() {
            this.$loading.css({
                display: 'none'
            });
        },
        setPosition: function() {
            var opts = this.options,
                pos,
                posCss = this.namespace + '-' + opts.position;

            this.width = this.$container.outerWidth();
            this.height = this.$container.outerHeight();

            if (opts.mouseTrace !== true) {
                //compute position
                if (opts.autoPosition === true) {
                    var newPos,
                        collisions = [];

                    if (opts.ajax === true && this.content === null) {
                        // use default value to judge collisions
                        collisions = getViewportCollisions(this.$target);
                    } else {
                        // change opts.postion
                        collisions = getViewportCollisions(this.$target, this.$container);
                    }

                    if (collisions.length === 0) {
                        newPos = opts.position;
                    } else if (collisions.length === 1) {
                        var res = resovolution[opts.position][collisions[0]];
                        if (res === undefined) {
                            newPos = opts.position;
                        } else {
                            newPos = res;
                        }
                    } else {
                        var cachString = POSITION;
                        $.each(collisions, function(i, v) {
                            cachString.replace(v, '');
                        });
                        newPos = cachString;
                    }

                    posCss = this.namespace + '-' + newPos;
                    pos = computePlacementCoords(this.$target, newPos, this.width, this.height, this.options.popSpace);
                } else {
                    pos = computePlacementCoords(this.$target, opts.position, this.width, this.height, this.options.popSpace);
                }

                //show container
                this.$container.css({
                    display: 'block',
                    top: pos.top,
                    left: pos.left
                });
            }

            this.posCss = posCss;
            this.$container.addClass(posCss);
        },
        _trigger: function(eventType) {
            // event
            this.$element.trigger('asColorInput::' + eventType, this);
            this.$element.trigger(eventType + '.asColorInput', this);

            // callback
            eventType = eventType.replace(/\b\w+\b/g, function(word) {
                return word.substring(0, 1).toUpperCase() + word.substring(1);
            });
            var onFunction = 'on' + eventType;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;
            if (typeof this.options[onFunction] === 'function') {
                this.options[onFunction].apply(this, method_arguments);
            }
        },

        /*
         *  Public Method
         */

        show: function() {
            var opts = this.options,
                self = this;

            if (!this.enabled) {
                return;
            }
            if (this.onlyOne) {
                $.each(dataPool, function(i, v) {
                    if (v === self) {
                        return;
                    } else {
                        if (v.isOpen) {
                            v.hide();
                        }
                    }
                });
            }
            this.$container = $(this.options.tpl.container);

            if (opts.closeBtn) {
                this.$container.append(this.$close);
            }
            this.$container.append(this.$arrow).append(this.$content);

            this.$element.addClass(this.namespace + '_active');

            // here judge the position first and then insert into body
            // if content has loaded , never load again
            this.content === null && this.load();

            if (this.content === null) {
                this.$content.append(this.$loading);
            } else {
                this.$content.empty().append(this.content);
            }

            if (opts.skin) {
                this.$container.addClass(this.namespace + '_' + opts.skin);
            }


            this.$container.css({
                display: 'none',
                top: 0,
                left: 0,
                position: 'absolute',
                zIndex: 99990
            });

            this.options.container ? this.$container.appendTo(this.options.container) : this.$container.insertAfter(this.$element);

            this.setPosition();

            this._trigger('show');
            this.isOpen = true;

            return this;
        },
        hide: function() {

            //unbinded all custom event
            this.$container.off('.asTooltip');
            //support event
            this._trigger('hide');

            this.$element.removeClass(this.namespace + '_active');

            this.$container.remove();

            this.isOpen = false;
            active = false;
        },
        setContent: function(content) {
            this.content = content;
        },
        enable: function() {
            this.enabled = true;
            this.$element.addClass(this.namespace + '-enabled');
            return this;
        },
        disable: function() {
            this.enabled = false;
            this.$element.removeClass(this.namespace + '-enabled');
            return this;
        },
        destroy: function() {
            this.$target.off('.asTooltip');
        }
    };

    AsTooltip.closeAll = function() {
        dataPool.map(function(instance) {
            if (instance.isOpen) {
                instance.hide();
            }
        });
    };

    // Static method default options.
    AsTooltip.defaults = {
        namespace: 'asTooltip',
        skin: null,

        onlyOne: false,
        trigger: 'hover', // hover click
        interactive: false,
        interactiveDelay: 500,
        mouseTrace: false,
        closeBtn: false,

        selector: false,
        container: 'body',

        popSpace: 10, //set the distance between tooltip and element

        position: 'n',
        autoPosition: true,

        delay: 0,
        effect: 'fade', // fade none zoom
        duration: 200,

        inline: false,
        content: null,

        ajax: false,
        ajaxSettings: {
            dataType: 'html',
            headers: {
                'tooltip': true
            }
        },

        onShow: null,
        onHide: null,
        onUpdate: null,

        tpl: {
            container: '<div class="asTooltip"></div>',
            loading: '<span class="{{namespace}}-loading"></span>',
            content: '<div class="{{namespace}}-content"></div>',
            arrow: '<span class="{{namespace}}-arrow"></span>',
            close: '<a class="{{namespace}}-close"></a>'
        }
    };

    $.fn.asTooltip = function(options) {
        if (typeof options === 'string') {
            var method = options;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;

            return this.each(function() {
                var api = $.data(this, 'asTooltip');
                if (typeof api[method] === 'function') {
                    api[method].apply(api, method_arguments);
                }
            });
        } else {
            return this.each(function() {
                if (!$.data(this, 'asTooltip')) {
                    $.data(this, 'asTooltip', new AsTooltip(this, options));
                }
            });
        }
    };

}(jQuery));