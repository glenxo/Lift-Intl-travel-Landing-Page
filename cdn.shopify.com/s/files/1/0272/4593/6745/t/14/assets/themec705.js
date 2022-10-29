window.slate = window.slate || {};
window.theme = window.theme || {};

/*================ Slate ================*/
/**
 * A11y Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help make your theme more accessible
 * to users with visual impairments.
 *
 *
 * @namespace a11y
 */

slate.a11y = {

  /**
   * For use when focus shifts to a container rather than a link
   * eg for In-page links, after scroll, focus shifts to content area so that
   * next `tab` is where user expects if focusing a link, just $link.focus();
   *
   * @param {JQuery} $element - The element to be acted upon
   */
  pageLinkFocus: function($element) {
    var focusClass = 'js-focus-hidden';

    $element.first()
      .attr('tabIndex', '-1')
      .focus()
      .addClass(focusClass)
      .one('blur', callback);

    function callback() {
      $element.first()
        .removeClass(focusClass)
        .removeAttr('tabindex');
    }
  },

  /**
   * If there's a hash in the url, focus the appropriate element
   */
  focusHash: function() {
    var hash = window.location.hash;

    // is there a hash in the url? is it an element on the page?
    if (hash && document.getElementById(hash.slice(1))) {
      this.pageLinkFocus($(hash));
    }
  },

  /**
   * When an in-page (url w/hash) link is clicked, focus the appropriate element
   */
  bindInPageLinks: function() {
    $('a[href*=#]').on('click', function(evt) {
      this.pageLinkFocus($(evt.currentTarget.hash));
    }.bind(this));
  },

  /**
   * Traps the focus in a particular container
   *
   * @param {object} options - Options to be used
   * @param {jQuery} options.$container - Container to trap focus within
   * @param {jQuery} options.$elementToFocus - Element to be focused when focus leaves container
   * @param {string} options.namespace - Namespace used for new focus event handler
   */
  trapFocus: function(options) {
    var eventName = options.namespace ?
      'focusin.' + options.namespace :
      'focusin';

    if (!options.$elementToFocus) {
      options.$elementToFocus = options.$container;
    }

    options.$container.attr('tabindex', '-1');
    options.$elementToFocus.focus();

    $(document).on(eventName, function(evt) {
      if (options.$container[0] !== evt.target && !options.$container.has(evt.target).length) {
        options.$container.focus();
      }
    });
  },

  /**
   * Removes the trap of focus in a particular container
   *
   * @param {object} options - Options to be used
   * @param {jQuery} options.$container - Container to trap focus within
   * @param {string} options.namespace - Namespace used for new focus event handler
   */
  removeTrapFocus: function(options) {
    var eventName = options.namespace ?
      'focusin.' + options.namespace :
      'focusin';

    if (options.$container && options.$container.length) {
      options.$container.removeAttr('tabindex');
    }

    $(document).off(eventName);
  }
};

/**
 * Cart Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Cart template.
 *
 * @namespace cart
 */

slate.cart = {

  /**
   * Browser cookies are required to use the cart. This function checks if
   * cookies are enabled in the browser.
   */
  cookiesEnabled: function() {
    var cookieEnabled = navigator.cookieEnabled;

    if (!cookieEnabled) {
      document.cookie = 'testcookie';
      cookieEnabled = (document.cookie.indexOf('testcookie') !== -1);
    }
    return cookieEnabled;
  },

  cart: function() {
    const $productFormAjax = $('.product-form--ajax'),
      $cartDrawer = $('[data-mini-cart]'),
      $qtySelector = '[data-item-quantity]',
      $itemsContainer = $('[data-mini-cart-items]'),
      $cartItemAlert = $('.bag__item-alert '),
      $totals = $('[data-cart-total]'),
      $checkoutBtn = $('[data-checkout]'),
      $qtyControls = $('.product__quantity-wrapper--cart button'),
      skipCartAttr = $productFormAjax.attr('data-skip-cart');


    let skipCart = false;

    if (skipCartAttr == "true") {
      skipCart = true;
    }

    const activeClass = 'is-visible',
      processingClass = 'is-processing';

    // On product form submit
    $('body').on('submit', '.product-form--ajax', function(e) {
      e.preventDefault();

      const formData = $(this).serializeArray(),
        formJSON = {};

      //Form data to JSON
      $.each(formData, function(i, v) {
        formJSON[v.name] = v.value;
      });

      //Add form json to cart
      addItemToCart(formJSON);
    });

    // When quantity is changed within cart
    $('body').on('change', $qtySelector, function() {
      const variantId = $(this).attr('data-variant-id'),
        quantity = $(this).val();

      updateItemQuantity(variantId, quantity);
    });
    
    //Check for cart notes 
    $checkoutBtn.click(function(e) {
      e.preventDefault();
      
      const $cartNote = $('.js-cart-note');
      
      if ($cartNote.length && $cartNote.val() != '') {
        updateCartNote($cartNote.val());
      }
      else {
        window.location.replace('/checkout');
      }
    });

    // Post product data to cart
    function addItemToCart(data) {
      $.ajax({
        type: 'POST',
        url: '/cart/add.js',
        data: data,
        dataType: 'json'

      }).done(function(itemData) { // if successful
        if (skipCart) {
          window.location.replace('/checkout');
        } else {
          updateCart();
        }
      }).fail(function(xhr, textStatus) { // if fail
        console.log("addItemToCart error");
      });
    };
    
    function updateCartNote(value) {
      $.ajax({
        url: '/cart/update.js',
        type: 'POST',
        data: {note: value},
        dataType: 'json',
        success: function(result) { 
          window.location.replace('/checkout');
        },
        error: function(jqxhr, status, exception) {
          window.location.replace('/checkout');
        }
      });
    }

    // Get cart data
    function updateCart() {
      $.ajax({
        type: 'GET',
        url: '/cart.js',
        dataType: 'json'
      }).done(function(cartData) { // if successful

        updateCartRefs(cartData['item_count'], cartData['total_price']); // update references
        populateCart(); // update mini cart

      }).fail(function(xhr, textStatus) { // if fail
        console.log("updateCart error");
      });
    };

    // Add items to mini cart
    function populateCart() {
      $.get({
        url: '/cart?view=ajax'
      }).done(function(newCartItems) { // if successful

        // Add updated cart data
        const $newCartItems = $.parseHTML(newCartItems);
        $itemsContainer.html($newCartItems);

        var sections = new slate.Sections();
        sections.register('product', theme.Product);

        //Open cart drawer
        openCart();

      }).fail(function(xhr, textStatus) { // if fail
        console.log("populateCart error");
      });

    };

    // Update cart alert and totals
    function updateCartRefs(count, total) {
      if (count >= 1) {
        $cartItemAlert.addClass(activeClass);
      } else {
        $cartItemAlert.removeClass(activeClass);
      }

      $totals.html(slate.Currency.formatMoney(total, theme.moneyFormat));
    };

    function updateItemQuantity(id, qty) {
      $.ajax({
        type: 'POST',
        url: '/cart/update?updates[' + id + ']=' + qty,
        beforeSend: function() {
          toggleCheckoutButton(false);
        }
      }).done(function(data) { // if successful
        updateCart();
      }).fail(function(xhr, textStatus) { // if fail
        console.log('updateItemQuantity error');
      }).always(function() {
        toggleCheckoutButton(true);
      });
    };

    // Enable / disable checkout button
    function toggleCheckoutButton(status) {
      if (status === true) {
        $qtyControls.removeAttr('disabled').removeClass(processingClass);
        $checkoutBtn.removeAttr('disabled').removeClass(processingClass);
      } else {
        $qtyControls.attr('disabled', '').addClass(processingClass);
        $checkoutBtn.attr('disabled', '').addClass(processingClass);
      }
    };

    function openCart() {
      $cartDrawer.addClass(activeClass);
    }

    // Discount field 
    const $discountAction = $('.js-cart-discount-action');
    let checkoutUrl = '/checkout?discount=';

    $('.mini-cart').on('click', '.js-cart-discount-action', function() {
      const $discountField = $('.js-cart-discount');
      const discount = $discountField.val();

      if (discount != '' && typeof discount !== 'undefined') {
        const discountUrl = checkoutUrl + discount;
        window.location.href = discountUrl;
      }
    });

  }
};

/**
 * Utility helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions for dealing with arrays and objects
 *
 * @namespace utils
 */

slate.utils = {

  /**
   * Return an object from an array of objects that matches the provided key and value
   *
   * @param {array} array - Array of objects
   * @param {string} key - Key to match the value against
   * @param {string} value - Value to get match of
   */
  findInstance: function(array, key, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i][key] === value) {
        return array[i];
      }
    }
  },

  /**
   * Remove an object from an array of objects by matching the provided key and value
   *
   * @param {array} array - Array of objects
   * @param {string} key - Key to match the value against
   * @param {string} value - Value to get match of
   */
  removeInstance: function(array, key, value) {
    var i = array.length;
    while (i--) {
      if (array[i][key] === value) {
        array.splice(i, 1);
        break;
      }
    }

    return array;
  },

  /**
   * _.compact from lodash
   * Remove empty/false items from array
   * Source: https://github.com/lodash/lodash/blob/master/compact.js
   *
   * @param {array} array
   */
  compact: function(array) {
    var index = -1;
    var length = array == null ? 0 : array.length;
    var resIndex = 0;
    var result = [];

    while (++index < length) {
      var value = array[index];
      if (value) {
        result[resIndex++] = value;
      }
    }
    return result;
  },

  /**
   * _.defaultTo from lodash
   * Checks `value` to determine whether a default value should be returned in
   * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
   * or `undefined`.
   * Source: https://github.com/lodash/lodash/blob/master/defaultTo.js
   *
   * @param {*} value - Value to check
   * @param {*} defaultValue - Default value
   * @returns {*} - Returns the resolved value
   */
  defaultTo: function(value, defaultValue) {
    return (value == null || value !== value) ? defaultValue : value
  }
};

/**
 * Rich Text Editor
 * -----------------------------------------------------------------------------
 * Wrap iframes and tables in div tags to force responsive/scrollable layout.
 *
 * @namespace rte
 */

slate.rte = {
  /**
   * Wrap tables in a container div to make them scrollable when needed
   *
   * @param {object} options - Options to be used
   * @param {jquery} options.$tables - jquery object(s) of the table(s) to wrap
   * @param {string} options.tableWrapperClass - table wrapper class name
   */
  wrapTable: function(options) {
    var tableWrapperClass = typeof options.tableWrapperClass === "undefined" ? '' : options.tableWrapperClass;

    options.$tables.wrap('<div class="' + tableWrapperClass + '"></div>');
  },

  /**
   * Wrap iframes in a container div to make them responsive
   *
   * @param {object} options - Options to be used
   * @param {jquery} options.$iframes - jquery object(s) of the iframe(s) to wrap
   * @param {string} options.iframeWrapperClass - class name used on the wrapping div
   */
  wrapIframe: function(options) {
    var iframeWrapperClass = typeof options.iframeWrapperClass === "undefined" ? '' : options.iframeWrapperClass;

    options.$iframes.each(function() {
      // Add wrapper to make video responsive
      $(this).wrap('<div class="' + iframeWrapperClass + '"></div>');

      // Re-set the src attribute on each iframe after page load
      // for Chrome's "incorrect iFrame content on 'back'" bug.
      // https://code.google.com/p/chromium/issues/detail?id=395791
      // Need to specifically target video and admin bar
      this.src = this.src;
    });
  }
};

/**
 * Product Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Product template.
 *
 * @namespace product
 */


theme.Header = (function() {

  $(document).ready(function() {
    let $menuToggle = $('[data-toggle-mega-menu]');
    let $megaMenu = $('[data-mega-menu]');

    $menuToggle.click(function() {
      $menuToggle.toggleClass('active');
      $megaMenu.toggleClass('active');
    });

    $('[data-has-dropdown]').click(function(e) {
      e.preventDefault();
    });

    $('[data-toggle-mobile-submenu]').click(function(e) {
      $(this).closest('li').find('[data-toggle-mobile-submenu]').not(this).next('.header__oversized-dropdown__sub-list').removeClass('active');
      $(this).next('.header__oversized-dropdown__sub-list').toggleClass('active');
      e.preventDefault();
    });

    // Hide/show header on PDP
    let lastScrollTop = 0;
    const $productForm = $('.product-form');
    const $productFormAtc = $productForm.find('[data-add-to-cart]');
    const $headerPdp = $('.header--reveal');
    const $headerAtc = $('.header__atc');
    var scrollTimeout;
    var throttle = 300;

    if ($headerPdp.length) {
      $(window).scroll(function(event) {
        const $atcOffset = $productForm.offset().top + $productForm.outerHeight(true);

        if (!scrollTimeout) {
          scrollTimeout = setTimeout(function() {
            let st = $(this).scrollTop();
            if (st < $atcOffset) {
              $headerPdp.addClass('active');
              $headerAtc.removeClass('active');
            } else {
              $headerPdp.removeClass('active');
              $headerAtc.addClass('active');
            }

            scrollTimeout = null;
          }, throttle);
        }
      });
    }

    $('.js-header-atc').click(function() {
      $productForm.submit();
    });


  });



})();

slate.Sections = function Sections() {
  this.constructors = {};
  this.instances = [];

  $(document)
    .on('shopify:section:load', this._onSectionLoad.bind(this))
    .on('shopify:section:unload', this._onSectionUnload.bind(this))
    .on('shopify:section:select', this._onSelect.bind(this))
    .on('shopify:section:deselect', this._onDeselect.bind(this))
    .on('shopify:section:reorder', this._onReorder.bind(this))
    .on('shopify:block:select', this._onBlockSelect.bind(this))
    .on('shopify:block:deselect', this._onBlockDeselect.bind(this));
};

slate.Sections.prototype = $.extend({}, slate.Sections.prototype, {
  _createInstance: function(container, constructor) {
    var $container = $(container);
    var id = $container.attr('data-section-id');
    var type = $container.attr('data-section-type');

    constructor = constructor || this.constructors[type];

    if (typeof constructor === 'undefined') {
      return;
    }

    var instance = $.extend(new constructor(container), {
      id: id,
      type: type,
      container: container
    });

    this.instances.push(instance);

  },

  _onSectionLoad: function(evt) {
    var container = $('[data-section-id]', evt.target)[0];
    var $container = $('[data-section-id]', evt.target);

    if (container) {

      this._createInstance(container);

      //Hero slider
      let $heroSlider = $container;

      if ($heroSlider.hasClass('hero-slider')) {
        let enableDots = ($heroSlider.attr('data-dots') == 'true'),
          enableArrows = ($heroSlider.attr('data-arrows') == 'true'),
          enableAutoplay = ($heroSlider.attr('data-autoplay') == 'true'),
          duration = parseInt($heroSlider.attr('data-duration'));

        $heroSlider.slick({
          arrows: enableArrows,
          dots: enableDots,
          slidesToShow: 1,
          slidesToScroll: 1,
          autoplay: enableAutoplay,
          autoplaySpeed: duration,
          prevArrow: '<span class="fas fa-chevron-left arrow--left"></span>',
          nextArrow: '<span class="fas fa-chevron-right arrow--right"></span>'
        });
      }

      //Product Slider 
      const headerHeight = $('.header').height();
      const productInfoSpacing = 30;
      const $productImageSlider = $container.find('.product__images-slider');


      if ($productImageSlider.length) {
        const numOfThumbnails = $container.find('.product__images-thumbs > img').length;
        let slickCenterMode = false;

        if (numOfThumbnails >= 4) {
          slickCenterMode = true;
        }

        //Product images

        $productImageSlider.slick({
          slidesToShow: 1,
          slidesToScroll: 1,
          fade: true,
          prevArrow: '<span class="fas fa-chevron-left arrow--left"></span>',
          nextArrow: '<span class="fas fa-chevron-right arrow--right"></span>',
          adaptiveHeight: true
        });


        if (numOfThumbnails > 1) {
          $container.find('.product__images-thumbs').slick({
            slidesToShow: 4,
            slidesToScroll: 2,
            arrows: false,
            centerMode: slickCenterMode,
            focusOnSelect: true,
            asNavFor: '.product__images-slider'
          });
        }
      }
    }
    adjustHeaderOffset();
  },

  _onSectionUnload: function(evt) {
    var instance = slate.utils.findInstance(this.instances, 'id', evt.detail.sectionId);

    if (!instance) {
      return;
    }

    if (typeof instance.onUnload === 'function') {
      instance.onUnload(evt);
    }

    this.instances = slate.utils.removeInstance(this.instances, 'id', evt.detail.sectionId);
  },

  _onSelect: function(evt) {
    var instance = slate.utils.findInstance(this.instances, 'id', evt.detail.sectionId);
    var $container = $('[data-section-id]', evt.target);
    var containerId = $container.attr('id');

    //Pop up
    const $popup = $('.pop-up-modal', evt.target);
    const $popupFloat = $('.pop-up-float', evt.target);
    const $popupModalClose = $('.pop-up-modal__close--trigger', evt.target);
    const $popupFloatClose = $('.pop-up-float__close', evt.target);
    const $triggerPopupContainer = $('.pop-up-trigger', evt.target);
    const $triggerPopup = $('.pop-up-trigger__trigger', evt.target);
    const $triggerPopupClose = $('.pop-up-trigger__close', evt.target);
    const popupActiveClass = 'active';

    if ($popup.length) {
      $popup.addClass('active');
    } else {
      if ($('.pop-up-modal').length) {
        $('.pop-up-modal').removeClass('active');
      }
    }

    if ($popupFloat.length) {
      $popupFloat.addClass('active');
    } else {
      if ($('.pop-up-float').length) {
        $('.pop-up-float').removeClass('active');
      }
    }

    if ($triggerPopupContainer.length) {
      $triggerPopupContainer.addClass('active');
    } else {
      if ($('.pop-up-trigger').length) {
        $('.pop-up-trigger').removeClass('active');
      }
    }

    $triggerPopup.click(function() {
      $popupFloat.addClass(popupActiveClass);
    });

    $popupFloatClose.click(function() {
      $popupFloat.removeClass(popupActiveClass);
    });

    $triggerPopupClose.click(function() {
      $triggerPopupContainer.removeClass(popupActiveClass);
    });

    $popupModalClose.click(function() {
      $popup.hide();
    });

    $popup.find('form').submit(function() {
      $popupFloat.hide();
      $triggerPopupContainer.hide();
    });

    //Hero slider
    const $heroSlider = $('.hero-slider');

    if ($heroSlider.length) {

      $heroSlider.each(function() {
        let enableDots = ($(this).attr('data-dots') == 'true'),
          enableArrows = ($(this).attr('data-arrows') == 'true'),
          enableAutoplay = ($(this).attr('data-autoplay') == 'true'),
          duration = parseInt($(this).attr('data-duration'));

        $(this).slick({
          arrows: enableArrows,
          dots: enableDots,
          slidesToShow: 1,
          slidesToScroll: 1,
          autoplay: enableAutoplay,
          autoplaySpeed: duration,
          prevArrow: '<span class="fas fa-chevron-left arrow--left"></span>',
          nextArrow: '<span class="fas fa-chevron-right arrow--right"></span>'
        });
      });
    }

    //Product Slider 
    const headerHeight = $('.header').height();
    const productInfoSpacing = 30;
    const $productImageSlider = $('.product__images-slider');


    if ($productImageSlider.length) {
      const numOfThumbnails = $('.product__images-thumbs > img').length;
      let slickCenterMode = false;

      if (numOfThumbnails >= 4) {
        slickCenterMode = true;
      }

      //Product images

      $productImageSlider.slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: false,
        prevArrow: '<span class="fas fa-chevron-left arrow--left"></span>',
        nextArrow: '<span class="fas fa-chevron-right arrow--right"></span>',
        adaptiveHeight: true
      });


      if (numOfThumbnails > 1) {
        $('.product__images-thumbs').slick({
          slidesToShow: 4,
          slidesToScroll: 2,
          arrows: false,
          centerMode: slickCenterMode,
          focusOnSelect: true,
          asNavFor: '.product__images-slider'
        });
      }
    }

    if (instance && typeof instance.onSelect === 'function') {
      instance.onSelect(evt);
    }
  },

  _onDeselect: function(evt) {
    var instance = slate.utils.findInstance(this.instances, 'id', evt.detail.sectionId);

    if (instance && typeof instance.onDeselect === 'function') {
      instance.onDeselect(evt);
    }
  },

  _onReorder: function(evt) {
    var instance = slate.utils.findInstance(this.instances, 'id', evt.detail.sectionId);

    if (instance && typeof instance.onReorder === 'function') {
      instance.onReorder(evt);
    }
  },

  _onBlockSelect: function(evt) {
    var instance = slate.utils.findInstance(this.instances, 'id', evt.detail.sectionId);

    if (instance && typeof instance.onBlockSelect === 'function') {
      instance.onBlockSelect(evt);
    }
  },

  _onBlockDeselect: function(evt) {
    var instance = slate.utils.findInstance(this.instances, 'id', evt.detail.sectionId);

    if (instance && typeof instance.onBlockDeselect === 'function') {
      instance.onBlockDeselect(evt);
    }
  },

  register: function(type, constructor) {
    this.constructors[type] = constructor;

    $('[data-section-type=' + type + ']').each(function(index, container) {
      this._createInstance(container, constructor);
    }.bind(this));
  }
});

/**
 * Currency Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help with currency formatting
 *
 * Current contents
 * - formatMoney - Takes an amount in cents and returns it as a formatted dollar value.
 *
 */

slate.Currency = (function() {
  var moneyFormat = '${{amount}}';

  /**
   * Format money values based on your shop currency settings
   * @param  {Number|string} cents - value in cents or dollar amount e.g. 300 cents
   * or 3.00 dollars
   * @param  {String} format - shop money_format setting
   * @return {String} value - formatted value
   */
  function formatMoney(cents, format) {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (format || moneyFormat);

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = slate.utils.defaultTo(precision, 2);
      thousands = slate.utils.defaultTo(thousands, ',');
      decimal = slate.utils.defaultTo(decimal, '.');

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var centsAmount = parts[1] ? (decimal + parts[1]) : '';

      return dollarsAmount + centsAmount;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  }

  return {
    formatMoney: formatMoney
  };
})();

/**
 * Image Helper Functions
 * -----------------------------------------------------------------------------
 * A collection of functions that help with basic image operations.
 *
 */

slate.Image = (function() {

  /**
   * Preloads an image in memory and uses the browsers cache to store it until needed.
   *
   * @param {Array} images - A list of image urls
   * @param {String} size - A shopify image size attribute
   */

  function preload(images, size) {
    if (typeof images === 'string') {
      images = [images];
    }

    for (var i = 0; i < images.length; i++) {
      var image = images[i];
      this.loadImage(this.getSizedImageUrl(image, size));
    }
  }

  /**
   * Loads and caches an image in the browsers cache.
   * @param {string} path - An image url
   */
  function loadImage(path) {
    new Image().src = path;
  }

  /**
   * Find the Shopify image attribute size
   *
   * @param {string} src
   * @returns {null}
   */
  function imageSize(src) {
    var match = src.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\.@]/);

    if (match) {
      return match[1];
    } else {
      return null;
    }
  }

  /**
   * Adds a Shopify size attribute to a URL
   *
   * @param src
   * @param size
   * @returns {*}
   */
  function getSizedImageUrl(src, size) {
    if (size === null) {
      return src;
    }

    if (size === 'master') {
      return this.removeProtocol(src);
    }

    var match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);

    if (match) {
      var prefix = src.split(match[0]);
      var suffix = match[0];

      return this.removeProtocol(prefix[0] + '_' + size + suffix);
    } else {
      return null;
    }
  }

  function removeProtocol(path) {
    return path.replace(/http(s)?:/, '');
  }

  return {
    preload: preload,
    loadImage: loadImage,
    imageSize: imageSize,
    getSizedImageUrl: getSizedImageUrl,
    removeProtocol: removeProtocol
  };
})();

/**
 * Variant Selection scripts
 * ------------------------------------------------------------------------------
 *
 * Handles change events from the variant inputs in any `cart/add` forms that may
 * exist. Also updates the master select and triggers updates when the variants
 * price or image changes.
 *
 * @namespace variants
 */

slate.Variants = (function() {

  /**
   * Variant constructor
   *
   * @param {object} options - Settings from `product.js`
   */
  function Variants(options) {
    this.$container = options.$container;
    this.product = options.product;
    this.singleOptionSelector = options.singleOptionSelector;
    this.originalSelectorId = options.originalSelectorId;
    this.enableHistoryState = options.enableHistoryState;
    this.currentVariant = this._getVariantFromOptions();

    $(this.$container).on('change', this.singleOptionSelector, this._onSelectChange.bind(this));

  }

  Variants.prototype = $.extend({}, Variants.prototype, {

    /**
     * Get the currently selected options from add-to-cart form. Works with all
     * form input elements.
     *
     * @return {array} options - Values of currently selected variants
     */
    _getCurrentOptions: function() {
      var currentOptions = $.map($(this.singleOptionSelector, this.$container), function(element) {
        var $element = $(element);
        var type = $element.attr('type');
        var currentOption = {};

        if (type === 'radio' || type === 'checkbox') {
          if ($element[0].checked) {
            currentOption.value = $element.val();
            currentOption.index = $element.data('index');

            return currentOption;
          } else {
            return false;
          }
        } else {
          currentOption.value = $element.val();
          currentOption.index = $element.data('index');

          return currentOption;
        }
      });

      // remove any unchecked input values if using radio buttons or checkboxes
      currentOptions = slate.utils.compact(currentOptions);

      return currentOptions;
    },

    /**
     * Find variant based on selected values.
     *
     * @param  {array} selectedValues - Values of variant inputs
     * @return {object || undefined} found - Variant object from product.variants
     */
    _getVariantFromOptions: function() {
      var selectedValues = this._getCurrentOptions();
      var variants = this.product.variants;
      var found = false;

      variants.forEach(function(variant) {
        var satisfied = true;

        selectedValues.forEach(function(option) {
          if (satisfied) {
            satisfied = (option.value === variant[option.index]);
          }
        });

        if (satisfied) {
          found = variant;
        }
      });

      return found || null;
    },

    /**
     * Event handler for when a variant input changes.
     */
    _onSelectChange: function() {
      var variant = this._getVariantFromOptions();

      this.$container.trigger({
        type: 'variantChange',
        variant: variant
      });

      if (!variant) {
        return;
      }

      this._updateMasterSelect(variant);
      this._updateImages(variant);
      this._updatePrice(variant);
      this.currentVariant = variant;

      if (this.enableHistoryState) {
        this._updateHistoryState(variant);
      }
    },

    /**
     * Trigger event when variant image changes
     *
     * @param  {object} variant - Currently selected variant
     * @return {event}  variantImageChange
     */
    _updateImages: function(variant) {
      var variantImage = variant.featured_image || {};
      var currentVariantImage = this.currentVariant.featured_image || {};
      var variantImageId = '';

      if (variant.featured_image !== null) {
        variantImageId = variant.featured_image.id;
      }

      if (!variant.featured_image || variantImage.src === currentVariantImage.src) {
        return;
      }

      const $variantImage = $('[data-image-id="' + variantImageId + '"]').closest('.product__image');
      const variantImageIndex = parseInt($variantImage.attr('data-slick-index'));
      const $slider = $('.product__images-slider');

      if ($variantImage.length && $slider.length) {
        $slider.slick('slickGoTo', variantImageIndex);
      }

      this.$container.trigger({
        type: 'variantImageChange',
        variant: variant
      });
    },

    /**
     * Trigger event when variant price changes.
     *
     * @param  {object} variant - Currently selected variant
     * @return {event} variantPriceChange
     */
    _updatePrice: function(variant) {
      if (variant.price === this.currentVariant.price && variant.compare_at_price === this.currentVariant.compare_at_price) {
        return;
      }

      this.$container.trigger({
        type: 'variantPriceChange',
        variant: variant
      });
    },

    /**
     * Update history state for product deeplinking
     *
     * @param {object} variant - Currently selected variant
     */
    _updateHistoryState: function(variant) {
      if (!history.replaceState || !variant) {
        return;
      }

      var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
      window.history.replaceState({
        path: newurl
      }, '', newurl);
    },

    /**
     * Update hidden master select of variant change
     *
     * @param {object} variant - Currently selected variant
     */
    _updateMasterSelect: function(variant) {
      $(this.originalSelectorId, this.$container)[0].value = variant.id;
    }
  });

  return Variants;
})();


/*================ Sections ================*/
/**
 * Product Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Product template.
 *
 * @namespace product
 */

theme.Product = (function() {

  var selectors = {
    addToCart: '[data-add-to-cart]',
    addToCartText: '[data-add-to-cart-text]',
    comparePrice: '[data-compare-price]',
    percentageDiscount: '.js-percentage-discount',
    comparePriceText: '[data-compare-text]',
    originalSelectorId: '[data-product-select]',
    priceWrapper: '[data-price-wrapper]',
    productFeaturedImage: '[data-product-featured-image]',
    productJson: '[data-product-json]',
    productPrice: '[data-product-price]',
    productThumbs: '[data-product-single-thumbnail]',
    singleOptionSelector: '[data-single-option-selector]'
  };

  /**
   * Product section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function Product(container) {
    this.$container = $(container);

    // Stop parsing if we don't have the product json script tag when loading
    // section in the Theme Editor
    if (!$(selectors.productJson, this.$container).html()) {
      return;
    }

    var sectionId = this.$container.attr('data-section-id');
    this.productSingleObject = JSON.parse($(selectors.productJson, this.$container).html());

    var options = {
      $container: this.$container,
      enableHistoryState: this.$container.data('enable-history-state') || false,
      singleOptionSelector: selectors.singleOptionSelector,
      originalSelectorId: selectors.originalSelectorId,
      product: this.productSingleObject
    };

    this.settings = {};
    this.namespace = '.product';
    this.variants = new slate.Variants(options);
    this.$featuredImage = $(selectors.productFeaturedImage, this.$container);

    this.$container.on('variantChange' + this.namespace, this.updateAddToCartState.bind(this));
    this.$container.on('variantPriceChange' + this.namespace, this.updateProductPrices.bind(this));

    if (this.$featuredImage.length > 0) {
      this.settings.imageSize = slate.Image.imageSize(this.$featuredImage.attr('src'));
      slate.Image.preload(this.productSingleObject.images, this.settings.imageSize);

      this.$container.on('variantImageChange' + this.namespace, this.updateProductImage.bind(this));
    }
  }

  Product.prototype = $.extend({}, Product.prototype, {

    /**
     * Updates the DOM state of the add to cart button
     *
     * @param {boolean} enabled - Decides whether cart is enabled or disabled
     * @param {string} text - Updates the text notification content of the cart
     */
    updateAddToCartState: function(evt) {
      var variant = evt.variant;

      if (variant) {
        $(selectors.priceWrapper).removeClass('hide');
      } else {
        $(selectors.addToCart).prop('disabled', true);
        $(selectors.addToCartText).html(theme.strings.unavailable);
        $(selectors.priceWrapper).addClass('hide');
        return;
      }

      if (variant.available) {
        $(selectors.addToCart).prop('disabled', false);
        $(selectors.addToCartText).html(theme.strings.addToCart);
      } else {
        $(selectors.addToCart).prop('disabled', true);
        $(selectors.addToCartText).html(theme.strings.soldOut);
      }
    },

    /**
     * Updates the DOM with specified prices
     *
     * @param {string} productPrice - The current price of the product
     * @param {string} comparePrice - The original price of the product
     */
    updateProductPrices: function(evt) {
      var variant = evt.variant;
      var $comparePrice = $(selectors.comparePrice);
      var $compareEls = $comparePrice.add(selectors.comparePriceText);
      const $discount = $(selectors.percentageDiscount).closest('.sale-percentage');

      const saleClass = "on-sale";

      $(selectors.productPrice)
        .html(slate.Currency.formatMoney(variant.price, theme.moneyFormat));

      if (variant.compare_at_price > variant.price) {
        const percentage = Math.round(((variant.compare_at_price - variant.price) / variant.compare_at_price) * 100);

        $(selectors.productPrice).addClass(saleClass);
        $comparePrice.html(slate.Currency.formatMoney(variant.compare_at_price, theme.moneyFormat));
        $(selectors.percentageDiscount).html(percentage);

        $discount.removeClass('hide');
        $compareEls.removeClass('hide');
      } else {
        $(selectors.productPrice).removeClass(saleClass);
        $comparePrice.html('');

        $discount.addClass('hide');
        $compareEls.addClass('hide');
      }
    },

    /**
     * Updates the DOM with the specified image URL
     *
     * @param {string} src - Image src URL
     */
    updateProductImage: function(evt) {
      var variant = evt.variant;
      var sizedImgUrl = slate.Image.getSizedImageUrl(variant.featured_image.src, this.settings.imageSize);

      this.$featuredImage.attr('src', sizedImgUrl);
    },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      this.$container.off(this.namespace);
    }
  });

  //Product form quantity
  $('body').on('click', '.qty-control', function() {
    const $qty = $(this).closest('.product__quantity-wrapper').find('.product__quantity');
    const control = $(this).attr('data-control');
    const isCartQty = $qty.hasClass('product__quantity--cart');
    let val = $qty.val();

    if (control == "up") {
      val++;
    } else if (control == "down") {
      //If qty is in cart, allow to select 0
      if (isCartQty && val >= 1) {
        val--;
      }
      //If on PDP, don't allow 0
      else if (!isCartQty && val >= 2) {
        val--;
      }
    }

    $qty.val(val);
    $qty.trigger('change');
  });

  //Product hero video
  $('.js-open-video').click(function(e) {
    const $videoModal = $(this).closest('.video__hero').next('.video__modal');
    const $ytEmbed = $videoModal.find('iframe');
    const ytUrl = $(this).attr('data-video-url');

    if ($(this).hasClass('video__hero__btn')) {

      const ytArr = ytUrl.split('watch?v=');
      const ytId = ytArr[ytArr.length - 1];
      const embedUrl = "https://www.youtube.com/embed/" + ytId + "?autoplay=1";

      $ytEmbed[0].src = embedUrl;
    } else {
      $ytEmbed[0].src = "";
    }

    $videoModal.addClass('active');
    $('body').addClass('no-scroll');
    e.preventDefault();
  });

  $('.video__modal').not('.video__modal__content').click(function() {
    const $ytEmbed = $(this).find('iframe');
    $ytEmbed[0].src = "";

    $(this).removeClass('active');
    $('body').removeClass('no-scroll');
  });

  return Product;
})();

let quickCart = document.querySelector('.mini-cart');

function openQuickCart(e) {
  e.preventDefault();
  quickCart.classList.toggle('is-visible');
}

$('[data-toggle-bag]').on('click', function(evt) {
  openQuickCart(evt);
  if (quickCart.classList.contains('is-visible')) {
    document.body.classList.add('no-scroll');
  } else {
    document.body.classList.remove('no-scroll');
  }
});

const $heroSlider = $('.hero-slider');

let enableDots = ($heroSlider.attr('data-dots') == 'true'),
  enableArrows = ($heroSlider.attr('data-arrows') == 'true'),
  enableAutoplay = ($heroSlider.attr('data-autoplay') == 'true'),
  duration = parseInt($heroSlider.attr('data-duration'));


if ($heroSlider.length) {
  $heroSlider.slick({
    arrows: enableArrows,
    dots: enableDots,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: enableAutoplay,
    autoplaySpeed: duration,
    prevArrow: '<span class="fas fa-chevron-left arrow--left"></span>',
    nextArrow: '<span class="fas fa-chevron-right arrow--right"></span>'
  });
}

/*================ Templates ================*/
/**
 * Customer Addresses Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Customer Addresses
 * template.
 *
 * @namespace customerAddresses
 */

theme.customerAddresses = (function() {
  var $newAddressForm = $('#AddressNewForm');

  if (!$newAddressForm.length) {
    return;
  }

  // Initialize observers on address selectors, defined in shopify_common.js
  if (Shopify) {
    new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
      hideElement: 'AddressProvinceContainerNew'
    });
  }

  // Initialize each edit form's country/province selector
  $('.address-country-option').each(function() {
    var formId = $(this).data('form-id');
    var countrySelector = 'AddressCountry_' + formId;
    var provinceSelector = 'AddressProvince_' + formId;
    var containerSelector = 'AddressProvinceContainer_' + formId;

    new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
      hideElement: containerSelector
    });
  });

  // Toggle new/edit address forms
  $('.address-new-toggle').on('click', function() {
    $newAddressForm.toggleClass('hide');
  });

  $('.address-edit-toggle').on('click', function() {
    var formId = $(this).data('form-id');
    $('#EditAddress_' + formId).toggleClass('hide');
  });

  $('.address-delete').on('click', function() {
    var $el = $(this);
    var formId = $el.data('form-id');
    var confirmMessage = $el.data('confirm-message');
    if (confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
      Shopify.postLink('/account/addresses/' + formId, {
        parameters: {
          _method: 'delete'
        }
      });
    }
  });
})();

/**
 * Password Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Password template.
 *
 * @namespace password
 */

theme.customerLogin = (function() {
  var config = {
    recoverPasswordForm: '#RecoverPassword',
    hideRecoverPasswordLink: '#HideRecoverPasswordLink'
  };

  if (!$(config.recoverPasswordForm).length) {
    return;
  }

  checkUrlHash();
  resetPasswordSuccess();

  $(config.recoverPasswordForm).on('click', onShowHidePasswordForm);
  $(config.hideRecoverPasswordLink).on('click', onShowHidePasswordForm);

  function onShowHidePasswordForm(evt) {
    evt.preventDefault();
    toggleRecoverPasswordForm();
  }

  function checkUrlHash() {
    var hash = window.location.hash;

    // Allow deep linking to recover password form
    if (hash === '#recover') {
      toggleRecoverPasswordForm();
    }
  }

  /**
   *  Show/Hide recover password form
   */
  function toggleRecoverPasswordForm() {
    $('#RecoverPasswordForm').toggleClass('hide');
    $('#CustomerLoginForm').toggleClass('hide');
  }

  /**
   *  Show reset password success message
   */
  function resetPasswordSuccess() {
    var $formState = $('.reset-password-success');

    // check if reset password form was successfully submited.
    if (!$formState.length) {
      return;
    }

    // show success message
    $('#ResetSuccess').removeClass('hide');
  }
})();

function adjustHeaderOffset() {
  const headerHeight = $('.header').height();
  const $mainContent = $('#MainContent');

  $mainContent.css({
    'margin-top': headerHeight
  });

  setTimeout(function() {
    $mainContent.addClass('content--reveal');
  }, 100);
}

$(document).ready(function() {
  // Adjust header offset
  adjustHeaderOffset();
  
  var sections = new slate.Sections();
  sections.register('product', theme.Product);

  // Common a11y fixes
  slate.a11y.pageLinkFocus($(window.location.hash));

  $('.in-page-link').on('click', function(evt) {
    slate.a11y.pageLinkFocus($(evt.currentTarget.hash));
  });

  slate.cart.cart();

  // Target tables to make them scrollable
  var tableSelectors = '.rte table';

  slate.rte.wrapTable({
    $tables: $(tableSelectors),
    tableWrapperClass: 'rte__table-wrapper',
  });

  // Target iframes to make them responsive
  var iframeSelectors =
    '.rte iframe[src*="youtube.com/embed"],' +
    '.rte iframe[src*="player.vimeo"]';

  slate.rte.wrapIframe({
    $iframes: $(iframeSelectors),
    iframeWrapperClass: 'rte__video-wrapper'
  });

  //Sticky product form
  const productInfoSpacing = 30;
  const $productImageSlider = $('.product__images-slider');

  const numOfThumbnails = $('.product__images-thumbs > img').length;
  let slickCenterMode = false;

  if (numOfThumbnails >= 4) {
    slickCenterMode = true;
  }

  //Product images
  if ($productImageSlider.length) {
    $productImageSlider.slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      fade: true,
      prevArrow: '<span class="fas fa-chevron-left arrow--left"></span>',
      nextArrow: '<span class="fas fa-chevron-right arrow--right"></span>',
      adaptiveHeight: true
    });
  }

  if (numOfThumbnails > 1) {
    $('.product__images-thumbs').slick({
      slidesToShow: 4,
      slidesToScroll: 2,
      arrows: false,
      centerMode: slickCenterMode,
      focusOnSelect: true,
      asNavFor: '.product__images-slider'
    });
  }

  const $salesPop = $('.sales-pop__box');
  const $salesPopContainer = $('.sales-pop');
  const $salesPopData = $('.sales-pop__data');
  const $salesPopName = $('.sales-pop__name');
  const $salesPopLocation = $('.sales-pop__location');
  const $salesPopTimestamp = $('.sales-pop__timestamp');

  let salesPopNames = false,
    salesPopLocations = false,
    salesPopTimestamps = false;

  if ($salesPop.length) {
    salesPopNames = $salesPopData.attr('data-names').split(',');
    salesPopLocations = $salesPopData.attr('data-locations').split(',');
    salesPopTimestamps = $salesPopData.attr('data-timestamp').split(',');
  }

  const isRandom = $salesPopData.attr('data-selection') == 'random' ? true : false;
  const activeClass = 'active';

  let numOfLocations = salesPopLocations.length - 1;
  let cycleNotification;
  let salesPopIndex = 0;
  let indexArr = [];

  if ($salesPop.length) {
    startSalesPop($salesPop);

    const $closeSalesPop = $('.sales-pop__close');

    $closeSalesPop.click(function() {
      $salesPop.addClass('hidden');
      $salesPopContainer.removeClass(activeClass);
      clearInterval(cycleNotification);
    });
  }

  function startSalesPop($elem) {
    const delayShow = setTimeout(function() {

      let index = 0;
      numOfLocations = salesPopLocations.length - 1;

      if (isRandom) {
        index = Math.floor(Math.random() * numOfLocations);
      }

      if (salesPopNames.length) {
        $salesPopName.text(salesPopNames[index]);
      } else {
        $salesPopName.text('Someone');
      }

      $salesPopLocation.text(salesPopLocations[index]);
      $salesPopTimestamp.text(salesPopTimestamps[index]);

      salesPopNames.splice(index, 1);
      salesPopLocations.splice(index, 1);
      salesPopTimestamps.splice(index, 1);

      $salesPop.addClass(activeClass);
      $salesPopContainer.addClass(activeClass);

      const delayHide = setTimeout(function() {
        $salesPop.removeClass(activeClass);

        const delayZIndex = setTimeout(function() {
          $salesPopContainer.removeClass(activeClass);
        }, 750);
      }, 10000);

      swapSalesPop();
    }, 15000);
  }

  function swapSalesPop(swap) {
    cycleNotification = setInterval(function() {

      if (salesPopLocations.length) {

        let index = 0;
        numOfLocations = salesPopLocations.length - 1;

        if (isRandom) {
          index = Math.floor(Math.random() * numOfLocations);
        }

        if (salesPopNames.length) {
          $salesPopName.text(salesPopNames[index]);
        } else {
          $salesPopName.text('Someone');
        }

        $salesPopLocation.text(salesPopLocations[index]);
        $salesPopTimestamp.text(salesPopTimestamps[index]);

        salesPopNames.splice(index, 1);
        salesPopLocations.splice(index, 1);
        salesPopTimestamps.splice(index, 1);

        $salesPop.addClass(activeClass);
        $salesPopContainer.addClass(activeClass);

        const transitionOut = setTimeout(function() {
          $salesPop.removeClass(activeClass);

          const delayZIndex = setTimeout(function() {
            $salesPopContainer.removeClass(activeClass);
          }, 750);
        }, 10000);
      } else {
        $salesPop.addClass('hidden');
        $salesPopContainer.removeClass(activeClass);
        clearInterval(cycleNotification);
      }

    }, 25000);
  }
  
  //PLP icon bars 
  const $plpIconBar = $('.js-plp-icon-bar');
  
  if ($plpIconBar.length) {
    $plpIconBar.slick({
      arrows: false,
      dots: false,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3000,
      mobileFirst: true,
      responsive: [
        {
          breakpoint: 768,
          settings: "unslick"
        }
      ]
    });
  }

  //Sticky pop-up
  const $popupFloat = $('.pop-up-float');
  const $popupModal = $('.pop-up-modal');
  const $popupModalClose = $('.pop-up-modal__close--trigger');
  const $popupFloatClose = $('.pop-up-float__close');
  const $triggerPopupContainer = $('.pop-up-trigger');
  const $triggerPopup = $('.pop-up-trigger__trigger');
  const $triggerPopupClose = $('.pop-up-trigger__close');
  const popupActiveClass = 'active';
  const popUpDelay = parseInt($popupModal.attr('data-delay')) * 1000;

  //Show trigger if cookie does not exist
  if (document.cookie.indexOf('promo-pop-up-float') == -1 && $triggerPopupContainer.length) {
    $triggerPopupContainer.addClass(popupActiveClass);
  }

  if (document.cookie.indexOf('promo-pop-up-modal') == -1 && $popupModal.length) {
    setTimeout(function() {
      document.cookie = 'promo-pop-up-modal=true';
      $popupModal.addClass(popupActiveClass);
    }, popUpDelay);
  }

  $triggerPopup.click(function() {
    $popupFloat.addClass(popupActiveClass);
  });

  $popupFloatClose.click(function() {
    $popupFloat.removeClass(popupActiveClass);
  });

  $triggerPopupClose.click(function() {
    $triggerPopupContainer.removeClass(popupActiveClass);
    document.cookie = 'promo-pop-up-float=true';
  });

  $popupModalClose.click(function() {
    document.cookie = 'promo-pop-up-modal=true';
    $popupModal.hide();
  });

  $popupModal.find('form').submit(function() {
    $popupFloat.hide();
    $triggerPopupContainer.hide();
    document.cookie = 'promo-pop-up-float=true';
  });

  //Lazy images 
  $(".lazy").Lazy({
    afterLoad: function($element) {
      $element.addClass("lazyloaded");
    }
  });
  
  // Blog listing
  
  $blogListing = $('.js-blog-listing');
  
  if ($blogListing.length) {
    $blogListing.slick({
      arrows: true,
      dots: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: false,
      prevArrow: '<span class="fas fa-chevron-left arrow--left"></span>',
      nextArrow: '<span class="fas fa-chevron-right arrow--right"></span>',
      mobileFirst: true,
      responsive: [
        {
          breakpoint: 450,
          settings: {
            slidesToShow: 2
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 3
          }
        },
        {
          breakpoint: 1000,
          settings: {
            slidesToShow: 4
          }
        }
      ]
    });
  }

  // Apply a specific class to the html element for browser support of cookies.
  if (slate.cart.cookiesEnabled()) {
    document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
  }
});