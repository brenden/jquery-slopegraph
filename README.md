jquery-slopegraph
=================

This plugin is a jQuery implementation of Edward Tufte's slopegraph.  

## Motivation

## Examples

### Basic slopegraph

Let's create a classic, two-column slopegraph showing how global computer ownership has increased from 2005 to 2011.

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
    //and so on...
  ]
}; 

// Display options
var options = {
  slopeWidth: 110
, slopeHeight: 300 
, dotSize: 4
, dotColor: '#212121'
};

// Call jquery-slopegraph
$('#graph').slopegraph(computerOwnership, options);
```

The above code will result in the following slopegraph:


### Reading from a table

As an alternative to inputing the graph data as a JavaScript object, you can specify an HTML table from which to read the
data. This allows for graceful degradation in environements which don't support JavaScript and makes it easy to add 
slopegraphs to existing webpages.

The data should be encoded in a table like so:

```html
<table id="table-demo">
  <caption>Some Values From a Table</caption>
  <thead>
    <tr>
      <th></th>
      <th>2011</th>
      <th>2012</th>
      <th>2013</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>Foo</th> <td>18.4</td> <td>10.2</td> <td>12.9</td>
    </tr>
    <tr>
      <th>Bar</th> <td>12.7</td> <td>16.2</td> <td>18.0</td>
    </tr>
  </tbody>
</table>
```
The table can be made into a slopegraph like this:

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
, header: ['2012', '2013']
, data: [
  {
    name: 'Foo'
  , series: [42, 80]
  , options: { lineColor: 'red' }
  }
, {
    name: 'Bar'
  , series: [7, 99] 
  }
  // ...    
};

$('#graph').slopegraph(example, { lineColor: 'blue' });

```

## Option parameters


## Dependencies
jquery-slopegraph uses nothing but HTML and the `canvas` element, so its only dependency is jQuery.

