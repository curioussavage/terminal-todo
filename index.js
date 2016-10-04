'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

var _reactBlessed = require('react-blessed');

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _nedb = require('nedb');

var _nedb2 = _interopRequireDefault(_nedb);

// Rendering a simple centered box

var App = (function (_Component) {
  _inherits(App, _Component);

  function App() {
    _classCallCheck(this, App);

    _get(Object.getPrototypeOf(App.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(App, [{
    key: 'render',
    value: function render() {
      return _react2['default'].createElement(
        'box',
        { top: 'center',
          left: 'center',
          width: '100%',
          height: '100%',
          border: { type: 'line' },
          style: { border: { fg: 'blue' } } },
        _react2['default'].createElement(
          'box',
          { height: '90%',
            width: '98%',
            border: { type: 'line' }

          },
          'poop'
        ),
        _react2['default'].createElement(
          'box',
          { bottom: '0',
            width: '98%',
            height: '10%',
            border: { type: 'line' }
          },
          'Hello world'
        )
      );
    }
  }]);

  return App;
})(_react.Component);

var db = new _nedb2['default']({ filename: __dirname + '/db', autoload: true });

_commander2['default'].version('0.0.1');

_commander2['default'].command('gui').description('run the gui').action(runGui);

_commander2['default'].command('add <title...>').description('add a todo').action(addTodo);

_commander2['default'].command('done <index>').description('mark a todo as done').action(markDone);

_commander2['default'].command('list').description('list todos').action(listTodos);

_commander2['default'].parse(process.argv);

function markDone(index) {
  db.find({ done: false }, function (err, docs) {
    var id = docs[index]._id;
    db.update({ _id: id }, { done: true });
  });
}

function listTodos() {
  db.find({ done: false }, function (err, docs) {
    docs.forEach(function (doc, index) {
      console.log(index + " - '" + doc.title + "' " + doc.created);
    });
  });
}

function Todo(title) {
  this.title = title;
  this.done = false;
  this.created = new Date();
}

Todo.prototype.toJson = function () {
  return {
    title: undefined.title,
    done: undefined.done,
    created: undefined.created.toString()
  };
};

function addTodo(title) {
  title = title.join(' ');
  db.insert(new Todo(title), function (err, newDocs) {
    console.log('success', newDocs);
  });
}

function runGui() {
  var screen = _blessed2['default'].screen({
    autoPadding: true,
    smartCSR: true,
    title: 'react-blessed hello world'
  });

  // Adding a way to quit the program
  screen.key(['escape', 'q', 'C-c'], function (ch, key) {
    return process.exit(0);
  });

  // Rendering the React app using our screen
  var component = (0, _reactBlessed.render)(_react2['default'].createElement(App, null), screen);
}
