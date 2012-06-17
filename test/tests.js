$(document).ready(function() {

  'use strict';

  test('throws error if data is missing', function() {
    raises(function() {
      $('#test').slopegraph();
    });
  });

  test('throws error if series are not all of the same length', function() {
    raises(function() {
      $('#test').slopegraph({
        title: 'Test'
      , header: ['A', 'B', 'C']
      , data: [
          {
            name: 'Foo'
          , series: [1, 2, 3]
          }
        , {
            name: 'Bar'
          , series: [4, 5]
          }
       ]
      });
    });
  });

  test('object and table input methods are equivalent', function() {
    $('#test-table').slopegraph();
    $('#test').slopegraph({
      title: 'Test'
    , header: ['2011', '2012', '2013']
    , data: [
        {
          name: 'Foo'
        , series: [18.4, 10.2, 12.9]
        , options: { addClass: 'testing' }
        }
      , {
          name: 'Bar'
        , series: [12.7, 16.2, 18.0]
        }
      ]
    });
    equal($('#test-table').html(), $('#test').html());
  });
});
