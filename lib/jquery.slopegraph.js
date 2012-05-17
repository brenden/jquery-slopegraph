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
  , slopeHeight: 300
  };

  if (typeof $ !== 'function') {
    throw new Error('Unable to find jQuery');
  }

  $.fn.slopegraph = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    var options = $.extend(defaults, args.pop());

    return this.each(function() {
      var $graph = $(this);

      var data = ($graph.is('table'))
        ? parseTableData($graph)
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
    
      var entries = entrySlice(data, 1);
      var $l = buildEntryList(entries, false);
      //$(this).append($l);


      /*
       * Given the `data` and a series index, `atStep`, return a collection 
       * representing a slice through all series at `timeStep`. The name,
       * value, and vertical display position are included for each entry.
       * @param (Object) data
       * @param (Integer) atStep
       * @return (Object)
       */
      function entrySlice(data, atStep) {
        var valueRange = bounds[1] - bounds[0];

        return data.map(function(d) {
          var value = d.series[atStep];

          return {
            name: d.name
          , value: value
          , position: (value-bounds[0])/valueRange * options.slopeHeight
          }
        });  
      }

      /*
       * Given a visible jQuery `$element`, return its upper and lower bounds.
       */
      function elementVerticalBounds($element) {
        var elementTop = $element.offset().top;

        return [
          elementTop
        , elementTop + $element.height()
        ];
      }

      /*
       * Given a mapping of entry name to value, construct the markup for a
       * a list showing the names spaced vertically according to their values.
       * `valueFirst` indicates whether or not the value should be placed before 
       * the entry name.
       * @param (Object) entries
       * @param (Truthy) valueFirst
       * @return (jQuery)
       */
      function buildEntryList(entries, valueFirst) {

        // List markup elements
        var $list = $('<ol class="slopegraph-list"></ol>');
        var $entry = $('<li><label class="slopegraph-value"></label></li>'); 

        // Select the right jQuery method for adding the names
        var namePlacement = valueFirst ? 'append' : 'prepend';

        // Sort the entries by position
        entries.sort(function(a, b) {
          return a.position - b.position;
        });

        // To find the heights of the entries, the list must be temporarily 
        // inserted into the document
        $graph.append($list);

        entries.forEach(function(entry) {
          var name = entry.name;
          var value = entry.value;
          var position = entry.position;

          // Append the entry
          var $newEntry = $entry.clone();
          var $lastEntry = $list.find('li').last();
          $list.append($newEntry);

          // Set its name and value
          $newEntry.find('.slopegraph-value').html(value);
          $newEntry[namePlacement](name);

          // Set its position
          var lastPosition = ($lastEntry.length) 
            ? $lastEntry.offset().top + $lastEntry.height()
            : 0
            ;
          var newPosition = Math.max(
            position - lastPosition
          , 0
          );
          
          $newEntry.css('margin-top', newPosition);
        });

        return $list;
      }
    });
  };
})(jQuery);
