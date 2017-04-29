"use strict";

(function($) {
  var defaultOptions = {
    nowrap : false
  };

  var HORIZONTAL = 1;
  var VERTICAL = 2;

  var init = function($el, options) {
    var needsFix = parseInt($el.css('padding-top'), 0) > 0 || $el.css('display') === 'inline-block';
    var marginFix = needsFix? 'width: 100%;display: inline-block;' : '';
    var style = (options.nowrap? 'white-space: nowrap;display: inline-block;' : marginFix);
    $el.html('<div class="canned-text" style="' + style + '">' + $el.html() + '</div>');
  };

  var fontSizeOfEl = function($el) {
    return parseInt($el.css('font-size'), 10);
  };

  var setFontSizeOfEl = function($el, fontSize) {
    $el.css('font-size', fontSize + "px");
  };

  var heightOfEl = function($el) {
    return $el.height();
  };

  var widthOfEl = function($el) {
    return $el.width();
  };

  var innerHeightOfEl = function($el) {
    return $el.innerHeight();
  };

  var innerWidthOfEl = function($el) {
    return $el.innerWidth();
  };

  var getChangeTracker = function($content, sizeGetter) {
    return new ChangeTracker(function() {
      return sizeGetter($content);
    });
  };

  var sizeGetterForDirection = function(direction) {
    return direction == HORIZONTAL? widthOfEl : heightOfEl;
  };

  var innerSizeGetterForDirection = function(direction) {
    return direction == HORIZONTAL? innerWidthOfEl : innerHeightOfEl;
  };

  var canDirection = function($container, $content, options) {
    if (!options.nowrap) return VERTICAL;
    var containerRatio = widthOfEl($container) / heightOfEl($container);
    var contentRatio = innerWidthOfEl($content) / innerHeightOfEl($content);
    return contentRatio > containerRatio? HORIZONTAL : VERTICAL;
  };

  var ChangeTracker = function(block) {
    var currentValue;
    var previousValue;

    this.reset = function() {
      currentValue = previousValue = null;
    };

    this.changed = function() {
      return currentValue != previousValue;
    };

    this.update = function() {
      previousValue = currentValue;
      currentValue = block();
      return currentValue;
    };

    this.currentValue = function() {
      return currentValue;
    };
  };

  var LinearCanner = (function() {
    var Klass = function($el, options) {
      this.$el = $el;
      this.options = options;
    };

    Klass.prototype.can = function() {
      var $container = this.$el;
      var $content = $container.children().first();

      var fontSize = fontSizeOfEl($container);
      var direction = canDirection($container, $content, this.options);

      var innerSizeOf = innerSizeGetterForDirection(direction);
      var sizeOf = sizeGetterForDirection(direction);

      var containerSize = sizeOf($container);
      var contentSizeChangeTracker = getChangeTracker($content, innerSizeOf);

      fontSize = linearCan($container, containerSize, contentSizeChangeTracker, fontSize, 1, greaterThan);
      contentSizeChangeTracker.reset();
      linearCan($container, containerSize, contentSizeChangeTracker, fontSize, -1, smallerThan);
    };

    var linearCan = function($container, containerSize, contentSizeChangeTracker, fontSize, offset, compare) {
      while(canCondition(compare, containerSize, contentSizeChangeTracker)) {
        setFontSizeOfEl($container, fontSize += offset);
      }
      return fontSize;
    };

    var canCondition = function(compare, containerSize, contentSizeChangeTracker) {
      var contentSize = contentSizeChangeTracker.update();
      if(!contentSizeChangeTracker.changed()) return false;
      return compare(containerSize, contentSize);
    };

    var smallerThan = function(op1, op2) {
      return op1 < op2;
    };

    var greaterThan = function(op1, op2) {
      return op1 > op2;
    };

    return Klass;
  })();

  var BinaryCanner = (function() {
    var Klass = function($el, options) {
      this.$el = $el;
      this.options = options;
    };

    Klass.prototype.can = function() {
      binaryCan(this.$el, this.$el.children().first(), this.options);
      return this;
    };

    var FontBinaryStepper = function($container, containerSize, contentSizeChangeTracker) {
      this.$container = $container;
      this.fontSize = this.fontSizeOffset = fontSizeOfEl($container);
      this.containerSize = containerSize;
      this.contentSizeChangeTracker = contentSizeChangeTracker;
      this.baseFontSize = 0;
    };

    FontBinaryStepper.prototype.step = function() {
      if (this.contentSizeChangeTracker.currentValue() < this.containerSize) {
        this.baseFontSize = this.fontSize;
      }

      this.fontSizeOffset = Math.floor(this.fontSizeOffset / 2);
      this.fontSize = this.baseFontSize + this.fontSizeOffset;
      setFontSizeOfEl(this.$container, this.fontSize);
    };

    FontBinaryStepper.prototype.stopped = function() {
      return this.fontSizeOffset <= 0;
    };

    var binaryCan = function($container, $content, options) {
      var fontSize = fontSizeOfEl($container);
      var direction = canDirection($container, $content, options);

      var innerSizeOf = innerSizeGetterForDirection(direction);
      var sizeOf = sizeGetterForDirection(direction);

      var containerSize = sizeOf($container);
      var contentSizeChangeTracker = getChangeTracker($content, innerSizeOf);

      while (smallerThanContainer(containerSize, contentSizeChangeTracker)) {
        fontSize *= 2;
        setFontSizeOfEl($container, fontSize);
      }

      contentSizeChangeTracker.reset();
      var fontBinaryStepper = new FontBinaryStepper($container, containerSize, contentSizeChangeTracker);

      while (notCanned(containerSize, contentSizeChangeTracker) && !fontBinaryStepper.stopped()) {
        fontBinaryStepper.step();
      }

      return contentSizeChangeTracker.changed();
    };

    var notCanned = function(containerSize, contentSizeChangeTracker) {
      var contentSize = contentSizeChangeTracker.update();
      if (!contentSizeChangeTracker.changed()) return false;
      return contentSize != containerSize;
    };

    var smallerThanContainer = function(containerSize, contentSizeChangeTracker) {
      var contentSize = contentSizeChangeTracker.update();
      if (!contentSizeChangeTracker.changed()) return false;
      return contentSize < containerSize;
    };

    return Klass;
  })();

  $.fn.canText = function(options) {
    return this.each(function() {
      var $el = $(this);
      var mergedOptions = $.extend({}, defaultOptions, options);

      init($el, mergedOptions);
      // BinaryCanner is faster when converting an arbitrary initial font size
      // to the right size to fit into the content.
      new BinaryCanner($el, mergedOptions).can();

      // Later, user triggered window size changes are commonly performed
      // in small increments. In these cases a LinearCanner proved faster.
      var canner = new LinearCanner($el, mergedOptions);
      $(window).resize(function() {
        canner.can();
      });
    });
  };
})(jQuery);