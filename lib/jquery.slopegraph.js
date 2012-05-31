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
  , lineColor: '#545454'
  , lineSize: 1.5
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
      var entrySlices = [];
      var listSpans = [];

      for (var i=0; i<seriesLength; i++) {
        var entries = entrySlice(data, i);
        var heading = header[i];
        var $container = buildEntryList(entries, heading);

        // Position list
        var position = i && listSpans[i-1].to + options.slopeWidth 
          - $graph.offset().left;
        $container.css('margin-left', position);
        $graph.append($container)

        // Remember list positioning information
        entrySlices.push(entries);
        listSpans.push({
          from: position
        , to: position + $container.outerWidth()
        });
      }

      // Add the canvas
      $graph.append('<canvas></canvas>');
      $canvas = $graph.find('canvas');
      $canvas.attr({
        width: listSpans[listSpans.length - 1].from - listSpans[0].to
      , height: options.slopeHeight + 1
      });
      $canvas.css('margin-left', listSpans[0].to);
      var canvas = $canvas.get(0);
      var ctx = canvas.getContext('2d');

      // Draw crisp lines on natural number coordinates
      ctx.translate(0.5, 0.5);

      // Draw the slope lines between the lists
      entrySlices.concat([data]).forEach(function(slice) {
        slice.sort(function(a, b) {
          return a.name < b.name;
        });
      });

      for (var i=0; i<data.length; i++) { 
        var linePoints = [];
        var seriesOptions = $.extend({}, options, data[i].options || {}); 

        for (var j=1; j<entrySlices.length; j++) {
          linePoints.push({
            from: {
              x: listSpans[j-1].to - listSpans[0].to
            , y: entrySlices[j-1][i].position
            }
          , to: {
              x: listSpans[j].from - listSpans[0].to
            , y: entrySlices[j][i].position
            }
          });
        }

        drawEntryLines(linePoints, seriesOptions);
      }

      /*
       * Given the `data` and a series index, `atStep`, return a collection 
       * representing a slice through all series at `atStep`. The name,
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
       * @param (Array) entries
       * @param (String) heading
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
          
          ($newEntry.is(':first-child')
            ? $list
            : $newEntry).css('margin-top', newPosition);
        });

        $container.detach();
        return $container;
      }

      /*
       * Draw the lines given by the points in `linePoints` using the styling
       * given by `options`
       * @param (Array) linePoints
       * @param (Object) options
       */
      function drawEntryLines(linePoints, options) {

        ctx.save();
        ctx.beginPath();
        setContextOptions(ctx, options);

        linePoints.forEach(function(line) {
          ctx.moveTo(line.from.x, line.from.y);
          ctx.lineTo(line.to.x, line.to.y);
        });

        ctx.stroke();
        ctx.closePath();
        ctx.restore();
      }

      /*
       * Set the given canvas context `ctx` given the options in `options`
       * @param (CanvasContext) ctx
       * @param (Object) options
       */
      function setContextOptions(ctx, options) {

        var APINameToCanvas = {
          lineColor: 'strokeStyle'
        , lineSize: 'lineWidth'
        };

        Object.keys(APINameToCanvas).forEach(function(option) {
          var value = options[option];
          var ctxKey = APINameToCanvas[option];
          ctx[ctxKey] = value;
        });
      }
    });
  };
})(jQuery);
