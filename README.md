jquery-slopegraph
=================

This plugin is a jQuery implementation of Edward Tufte's slopegraph.  

## Motivation
A slopegraph is a simple yet rarely-used design for displaying changes in multiple data series over time. The
graph was introduced by Edward Tufte in his 1983 book *The Visual Display of Quantitative Information*, but has only
recently seen much use. The article [Edward Tufte’s “Slopegraphs”](http://charliepark.org/slopegraphs/) gives a good
run down of when slopegraphs are a good choice for showing data:
> Basically: Any time you’d use a line chart to show a progression of univariate data among multiple actors over time,
> you might have a good candidate for a slopegraph.

## Examples

### Basic slopegraph

Below is a classic, two-column slopegraph showing how global computer ownership has increased from 2005 to 2011. Beneath 
the graph is the code which generated it.

<img src="http://github.com/brenden/jquery-slopegraph/raw/master/demo/slopegraph.png" />

```javascript
// Source: http://www.itu.int/ITU-D/ict/statistics/at_glance/KeyTelecom.html
var computerOwnership = {
  title: '% of Households with a Computer'
, header: ['2005', '2011']
, data: [
    {
      name: 'Africa'
    , series: [3.0, 7.9]
    }
  , {
      name: 'Arab States'
    , series: [14.9, 30.7] 
    }
    // and so on...
  ]
}; 

// Display options
var options = {
  slopeWidth: 110
, dotSize: 4
, dotColor: '#212121'
};

// Call jquery-slopegraph
$('#graph').slopegraph(computerOwnership, options);
```

### Reading from a table

As an alternative to inputing the graph data as a JavaScript object, you can specify an HTML table from which to read the
data. This allows for graceful degradation in environments which don't support JavaScript and makes it easy to add 
slopegraphs to existing webpages.

The data should be encoded in a table like so:

```html
<table id="table-demo">
  <caption>Some Values From a Table</caption>
  <thead>
    <tr>
      <th></th>
      <th>2011</th> <th>2012</th> <th>2013</th>
    </tr>
  </thead>
  <tbody>
    <tr> <th>Foo</th> <td>18.4</td> <td>10.2</td> <td>12.9</td> </tr>
    <tr> <th>Bar</th> <td>12.7</td> <td>16.2</td> <td>18.0</td> </tr>
  </tbody>
</table>
```
The table can then be made into a slopegraph like this:

```javascript
$('#table-demo').slopegraph(options);
```

### Highlighting a particular series

If an `options` object is passed as a parameter to the slopegraph call, it will apply to every series in the graph.
However, it is possible to override the global options on a series-by-series basis by attaching an `options` object to 
an individual series. For example, the following data will have its "Foo" series drawn in red, and every other one 
drawn in blue.

```javascript
var example = {
  title: 'Highlighting one series'
, header: ['2011', '2012', '2013']
, data: [
  {
    name: 'Foo'
  , series: [42, 80, 85]
  , options: { lineColor: 'red' }
  }
, {
    name: 'Bar'
  , series: [7, 99, 53] 
  }
  // ...    
};

$('#graph').slopegraph(example, { lineColor: 'blue' });
```

## Option parameters

<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Default Value</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>slopeWidth</th> 
      <td>100</td>
      <td>The pixel width of the slopeline box</td> 
    </tr>
    <tr>
      <th>slopeHeight</th> 
      <td>300</td> 
      <td>The pixel height of the slopeline box</td> 
    </tr>
    <tr>
      <th>reverseEntries</th>
      <td>false</td> 
      <td>Whether or not the entries should be reversed, making the lowest value occupy the highest vertical position</td> 
    </tr>
    <tr>
      <th>lineColor</th> 
      <td>'#545454'</td> 
      <td>The color of the slopelines</td> 
    </tr>
    <tr>
      <th>lineSize</th>
      <td>1.5</td> 
      <td>The thickness of the slopelines</td> 
    </tr>
    <tr>
      <th>dotColor</th> 
      <td>'#545454'</td> 
      <td>The color of the end-line dots</td> 
    </tr>
    <tr>
      <th>dotSize</th> 
      <td>0</td> 
      <td>The radius of the end-line dots. If 0, then no dots are drawn.</td> 
    </tr>
    <tr>
      <th>dotColor</th> 
      <td>'#545454'</td> 
      <td>The color of the end-line dots</td> 
    </tr>
    <tr>
      <th>addClass</th> 
      <td>undefined</td> 
      <td>When specified as a series option, this will add the given class to all list entries of the series. This makes
          it easy to apply special styles to the labels of a given series (see demo 3).</td> 
    </tr>
    <tr>
      <th>decimalPlaces</th> 
      <td>1</td> 
      <td>The number of decimal places to show in the the value labels</td> 
    </tr>
    <tr>
      <th>omitInteriorLabels</th> 
      <td>false</td>
      <td>Whether or not to hide the labels for all but the first and last entries of each series. For an example of
        this property in use, see demo 2</td> 
    </tr>
  </tbody>
</table>


## Dependencies
jquery-slopegraph uses nothing but HTML and the `canvas` element, so its only dependency is jQuery.

