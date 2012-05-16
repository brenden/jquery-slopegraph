/*
 * jquery.slopegraph.js
 *
 * A jQuery implementation of Tufte's slopegraph 
 *
 * @name jquery-slopegraph
 * @author Brenden Kokoszka
 * @license MIT
 */
;(function($) {

  var defaults = {};

  if (typeof $ !== 'function') {
    throw new Error('Unable to find jQuery');
  }

  $.fn.slopegraph = function(data, options) { 
    options = $.extend(defaults, options);

    return this.each(function() {

    });
  };
})(jQuery);
