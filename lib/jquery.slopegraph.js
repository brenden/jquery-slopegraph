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
  , lowToHigh: true
  };

  $.fn.slopegraph = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    var options = $.extend(defaults, args.pop());

    return this.each(function() {
      var $graph = $(this);

      var input = ($graph.is('table'))
        ? parseTableData($graph)
        : args.pop()
        ;

      // Check that valid data was given
      if (!input) {
        throw new Error('Table data not specified');
      }

      var data = input.data;
      var header = input.header;

      // Check that all series are of the same length
      var seriesLength = header.length;

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
   
      // Add the step lists
      var position;
      var entrySlices = [];

      for (var i=0; i<seriesLength; i++) {
        var entries = entrySlice(data, i);
        var heading = header[i];
        var $container = buildEntryList(entries, heading);
        var $lastContainer = $('.slopegraph-container:last-child');
        entrySlices.push(entries);

        // The leftmost list has its names placed before its values
        $container.addClass(i ? 'slopegraph-left' : 'slopegraph-right');

        // Position list
        position = ($lastContainer.length)
          ? $lastContainer.offset().left + $lastContainer.outerWidth()
            + options.slopeWidth - $graph.offset().left
          : 0
          ;
        $container.css('margin-left', position);
        $graph.append($container)
      }

      console.log('height', $graph.outerHeight());

      // Add the canvas
      $graph.append('<canvas></canvas>');
      $canvas = $graph.find('canvas');
      $canvas.attr({
        width: position
      , height: options.slopeHeight + 1
      });
      var canvas = $canvas.get(0);
      var ctx = canvas.getContext('2d');
      ctx.translate(0.5, 0.5)

      // Draw the slope lines between the lists
      for (var i=1; i<seriesLength; i++) {
        var fromEntries = entrySlices[i-1];
        var toEntries = entrySlices[i];
        var $nthContainer = $graph
          .find('.slopegraph-container:nth-child(' + i + ')');
        var startX = $nthContainer.offset().left - $graph.offset().left 
          + $nthContainer.outerWidth();
        drawEntryLines(fromEntries, toEntries, startX);
      }

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
          var position = ~~((value-bounds[0])/valueRange * options.slopeHeight);

          if (options.lowToHigh) {
            position = options.slopeHeight - position;
          }

          return {
            name: d.name
          , value: value
          , position: position
          }
        });  
      }

      /*
       * Given a mapping of entry name to value, construct the markup for a
       * a list showing the names spaced vertically according to their values.
       * @param (Object) entries
       * @return (jQuery)
       */
      function buildEntryList(entries, heading) {

        // List outer wrapper skeleton
        var $container = $('<span class="slopegraph-container">'
          + '<h4></h4>'
          + '</span>');

        // List skeleton
        var $list = $('<ol class="slopegraph-list"></ol>');

        // List entry skeleton
        var $entry = $('<li>' 
          + '<label class="slopegraph-name"></label>' 
          + '<label class="slopegraph-value"></label>'
          + '</li>');

        // Wrap list in container and add series title
        $container.find('h4').html(heading);
        $container.append($list);

        // Sort the entries by position
        entries.sort(function(a, b) {
          return a.position - b.position;
        });

        // To find the heights of the entries, the list must be temporarily 
        // inserted into the document
        $graph.append($container);

        entries.forEach(function(entry) {
          var name = entry.name;
          var value = entry.value;
          var position = entry.position;

          // Append the entry
          var $newEntry = $entry.clone();
          var $lastEntry = $list.find('li').last();
          $list.append($newEntry);

          // Set its name and value
          $newEntry.find('.slopegraph-value').html(value.toFixed(1));
          $newEntry.find('.slopegraph-name').html(name);

          // Set its position
          var lastPosition = ($lastEntry.length) 
            ? $lastEntry.offset().top + $lastEntry.height() 
              - $graph.offset().top
            : 0
            ;
          var newPosition = Math.max(
            position - lastPosition
          , 0
          );
          
          ($newEntry.is(':first-child') && false
            ? $list
            : $newEntry).css('margin-top', newPosition);
        });

        $container.detach();
        return $container;
      }

      /*
       * Draw the lines from the entries given by `fromEntries` to those given
       * by `toEntries`. Start the lines at the x coordinate `startX`
       */
      function drawEntryLines(fromEntries, toEntries, startX) {
        var toEntriesLookup = {};

        for (var i=0; i<toEntries.length; i++) {
          var entry = toEntries[i];
          toEntriesLookup[entry.name] = entry;
        }

        ctx.save();
        ctx.beginPath();
        console.log('d');
        fromEntries.forEach(function(entry) {
          var fromPosition = entry.position;
          var toPosition = toEntriesLookup[entry.name].position;
          console.log(startX, fromPosition, toPosition, options.slopeWidth)
          ctx.strokeStyle = '#545454';
          ctx.lineWidth = 1.5;
          ctx.moveTo(startX, fromPosition);
          ctx.lineTo(startX + options.slopeWidth, toPosition);
        });

        ctx.stroke();
        ctx.closePath();
        ctx.restore();
      }
    });
  };
})(jQuery);
