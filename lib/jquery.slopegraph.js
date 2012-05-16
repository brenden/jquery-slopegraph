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

  var defaults = {
    slopeWidth: 80
  , slopeHeight: 200
  };

  if (typeof $ !== 'function') {
    throw new Error('Unable to find jQuery');
  }

  $.fn.slopegraph = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    var options = $.extend(defaults, args.pop());

    return this.each(function() {
      var data = ($(this).is('table'))
        ? parseTableData($(this))
        : args.pop()
        ;

      // Check that valid data was given
      if (!data) {
        throw new Error('Table data not specified');
      }

      // Check that all series are of the same length
      var seriesLength = data[0].series.length;

      if (data.some(function(d) {
        return d.series.length !== seriesLength;
      })) {
        throw new Error('All data series must be of the same length');
      }

      // Calculate the grand minimum and maximum of the data
      var bounds = ['min', 'max'].map(function(m) {
        return Math[m].apply(Math, data.map(function(d) {
          return Math[m].apply(Math, d.series);
        }));
      });
    
      var nameToValue = entriesAtStep(data, 1);
      var $l = buildEntryList(nameToValue, true);
      $(this).append($l);

      /*
       * Given the `data` and a series index, `i`, return a mapping of entry
       * name to value at series position `i`
       * @param (Object) data
       * @param (Integer) i
       * @return (Object)
       */
      function entriesAtStep(data, i) {
        var nameToValue = {};
        
        for (var i=0; i<data.length; i++) {
          var d = data[i];
          nameToValue[d.name] = d.series[i];
        }

        return nameToValue;
      }


      /*
       * Given a mapping of entry names to values, return a mapping of entry 
       * names to positions on the y-axis.
       * @param (Object) entries
       * @return (Object)
       */
      function calculateEntryPositions(nameToValue) {
        var nameToPosition = {};
        var valueRange = bounds[1] - bounds[0];

        for (var name in nameToValue) {
          var value = nameToValue[name];
          var position = (value-bounds[0])/valueRange * options.slopeHeight;
          nameToPosition[name] = position;
        }

        return nameToPosition;
      }


      /*
       * Given a mapping of entry name to value, construct the markup for a
       * a list showing the names spaced vertically according to their values.
       * `valueFirst` indicates whether or not the value should be placed before 
       * the entry name.
       * @param (Object) nameToValue
       * @param (Truthy) valueFirst
       * @return (jQuery)
       */
      function buildEntryList(nameToValue, valueFirst) {
        var nameToPosition = calculateEntryPositions(nameToValue);

        // List markup elements
        var $list = $('<ol class="slopegraph-list"></ol>');
        var $entry = $('<li><label class="slopegraph-value"></label></li>');

        // Select the right jQuery method for adding the names
        var namePlacement = valueFirst ? 'append' : 'prepend';
 
        for (var name in nameToValue) {
          var value = nameToValue[name];
          var position = nameToPosition[name];

          // Insert data
          var $newEntry = $entry.clone();
          $newEntry.find('.slopegraph-value').html(value);
          $newEntry[namePlacement](name);
          $newEntry.css({
            position: 'absolute'
          , 'margin-top': position
          });
          $list.append($newEntry);
        }

        return $list;
      }
    });
  };
})(jQuery);
