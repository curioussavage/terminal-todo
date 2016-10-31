var blessedoo = require('blessedoo')();

var context = {
  doStuff: function() {
    console.log('ham');
  },
  doStuff2: function() {
    console.log('meow');
  }
};

function rows() {
  return [
    ['title', 'description', 'due'],
    ['hello', 'htis is  the description', '2016-10-06'],
    ['hello', 'htis is  the description', '2016-10-06']
  ]
}

blessedoo.loadView('view.xml', context, function(err, result) {
  blessedoo.setView(result);

  var list = blessedoo.getElementById('list')
  var box = blessedoo.getElementById('box')

  box.key('m', function() {
    box.content = 'foobar'
    blessedoo.render()
  })

  let screen = blessedoo.getScreen()

  screen.key(['q', 'C-c'], function(ch, key) {
    return process.exit(0);
  });

  list.setData(rows())
  blessedoo.render()
  box.focus()
});
