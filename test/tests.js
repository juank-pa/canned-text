describe('api', function() {
  var wrapper;
  var target;
  var currElem = 0;

  before(function() {
    wrapper = $('<div id="samples" />').appendTo('body');
  });

  beforeEach(function() {
    target = $('<div id="target"></div>').appendTo(wrapper);
  });

  afterEach(function() {
    target.remove();
  });

  describe('canText', function() {
    it('encloses the target element "the container" content within a div.canned-text "the content"', function() {
      expect(target.find('div.canned-text')).to.not.exist;
      target.canText();
      expect(target.find('div.canned-text')).to.exist;
    });

    context('with nowrap option set to true', function() {
      it('encloses the target element "the container" content within a div.canned-text "the content"', function() {
        expect(target.find('div.canned-text')).to.not.exist;
        target.canText({ nowrap: true });
        expect(target.find('div.canned-text')).to.exist;
      });

      it('prevents the content from wrapping', function() {
        target.canText({ nowrap: true });
        expect(target.find('.canned-text')).to.have.css('white-space', 'nowrap');
      });

      it('enclosing element is an inline-block', function() {
        target.canText({ nowrap: true });
        expect(target.find('.canned-text')).to.have.css('display', 'inline-block');
      });
    });

    var contentTypes = [
      {
        name: 'simple',
        content: 'My sample text to be canned'
      },
      {
        name: 'complex',
        content: '<h1>Sample</h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas vel imperdiet diam, id ultrices erat.<br>Etiam porttitor pulvinar malesuada. Suspendisse molestie et quam id condimentum</p>'
      }
    ];

    var canMethods = [
      {
        name: 'canText (first time)',
        sampleLoader: loadSample,
        canFn: canText
      },
      {
        name: 'window.resize',
        sampleLoader: loadAndCanSample,
        canFn: resizeWindow
      }
    ];

    canMethods.forEach(function(canMethod) {
      var canMethodName = canMethod.name;
      var sampleLoader = canMethod.sampleLoader;
      var canFn = canMethod.canFn;

      context('canning on ' + canMethodName, function() {
        contentTypes.forEach(function(contentType) {
          var contentTypeName = contentType.name;
          var content = contentType.content;

          context('for ' + contentTypeName + ' content', function() {
            context('with nowrap option set to false (default)', function() {
              context('when the content is bigger than the container', function() {
                beforeEach(function() {
                  sampleLoader('content-bigger-than-container', content);
                });

                it('reduces the font size of the content to can it into the container', function() {
                  var prevFontSize = targetFontSize();
                  canFn();
                  expect(targetFontSize()).to.be.at.most(prevFontSize);
                });

                itUpdatesContentHeight(canFn);

                it('the height of the content is always less than the size of the container', function() {
                  canFn();
                  expect(targetContentHeight()).to.be.at.most(target.height());
                });
              });

              context('when the content is smaller than the container', function() {
                beforeEach(function() {
                  sampleLoader('content-smaller-than-container', content);
                });

                it('increases the font size of the content to can it into the container', function() {
                  var prevFontSize = targetFontSize();
                  canFn();
                  expect(targetFontSize()).to.be.above(prevFontSize);
                });

                itUpdatesContentHeight(canFn);

                it('the height of the content is always less than the size of the container', function() {
                  canFn();
                  expect(targetContentHeight()).to.be.at.most(target.height());
                });
              });
            });

            context('with nowrap option set to true', function() {
              var options = { nowrap: true };

              context('if content aspect ratio is less than the container aspect ratio', function() {
                beforeEach(function() {
                  sampleLoader('content-aspect-ratio-smaller-than-container', content, options);
                });

                it('fits the content height into the container', function(){
                  canFn(options);

                  var contentWidth = targetContentWidth();
                  var contentHeight = targetContentHeight();
                  var containerWidth = target.width();
                  var containerHeight = target.height();
                  var widthDiff = containerWidth - targetContentWidth();
                  var heightDiff = containerHeight - targetContentHeight();

                  expect(contentWidth).to.be.at.most(containerWidth);
                  expect(contentHeight).to.be.at.most(containerHeight);
                  expect(heightDiff).to.be.at.most(widthDiff);
                });

                itUpdatesContentSize(function() { canFn(options); });
              });

              context('if content aspect ratio is greater than the container aspect ratio', function() {
                beforeEach(function() {
                  sampleLoader('content-aspect-ratio-greater-than-container', content, options);
                });

                it('fits the content width into the container', function(){
                  canFn(options);

                  var contentWidth = targetContentWidth();
                  var contentHeight = targetContentHeight();
                  var containerWidth = target.width();
                  var containerHeight = target.height();
                  var widthDiff = target.width() - targetContentWidth();
                  var heightDiff = target.height() - targetContentHeight();

                  expect(contentWidth).to.be.at.most(containerWidth);
                  expect(contentHeight).to.be.at.most(containerHeight);
                  expect(widthDiff).to.be.at.most(heightDiff);
                });

                itUpdatesContentSize(function() { canFn(options); });
              });
            });
          });
        });
      });
    });
  });

  function itUpdatesContentHeight(fn) {
    it('updates the content height', function() {
      var prevHeight = targetContentHeight();
      fn();
      expect(prevHeight).to.not.equal(targetContentHeight());
    });
  }

  function itUpdatesContentSize(fn) {
    it('updates the content width and height', function() {
      var prevWidth = targetContentWidth();
      var prevHeight = targetContentHeight();
      fn();
      expect(prevWidth).to.not.equal(targetContentWidth());
      expect(prevHeight).to.not.equal(targetContentHeight());
    });
  }

  function targetContentWidth() {
    return target.find('.canned-text').width();
  }

  function targetContentHeight() {
    return target.find('.canned-text').height();
  }

  function targetFontSize() {
    return parseInt(target.css('font-size'), 10);
  }

  function loadAndCanSample(name, content, options) {
    loadSample(name, content);
    target.canText(options);
  }

  function loadSample(name, content) {
    target.addClass(name);
    target.html(content);
  }

  function resizeWindow() {
    target.addClass('resized');
    $(window).trigger('resize');
  }

  function canText(options) {
    target.canText(options);
  }
});