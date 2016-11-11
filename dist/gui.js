'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = runGui;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

var _reactBlessed = require('react-blessed');

var _sugar = require('sugar');

var _sugar2 = _interopRequireDefault(_sugar);

var _eventemitter = require('eventemitter2');

var _db = require('./db.js');

var _todoForm = require('./todoForm');

var _todoForm2 = _interopRequireDefault(_todoForm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_Component) {
  _inherits(App, _Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this.state = {
      rows: props.rows,
      project: props.project,
      // should maybe call this visible not selected to be more specific
      singleColSelectedCat: props.project.categories.split(',')[0],
      selected: null,
      showMenu: false,
      showNewForm: false,
      viewMode: viewModes.normal,
      kanbanFocused: 0
    };
    return _this;
  }

  _createClass(App, [{
    key: 'formatedRows',
    value: function formatedRows() {
      var category = this.state.singleColSelectedCat;
      var rows = this.state.rows[category].map(function (row, index, list) {
        // this should be in a model
        var date = new _sugar2.default.Date(row.createdAt).format('%Y-%m-%d').raw;
        var due = '';
        if (row.due) {
          due = new _sugar2.default.Date(row.due).format('%Y-%m-%d').raw;
        }
        return [row.title, date, due];
      });

      rows.unshift(['Title', 'Created', 'Due']);
      return rows;
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.refs.table.focus();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      var _state = this.state,
          kanbanFocused = _state.kanbanFocused,
          viewMode = _state.viewMode;

      if (prevState.viewMode === viewModes.kanban && viewMode === viewModes.normal) {
        this.refs.table.focus();
      } else if (prevState.viewMode === viewModes.normal && viewMode === viewModes.kanban) {
        this.refs.k0.focus();
      }

      if (prevState.kanbanFocused !== kanbanFocused) {
        this.refs['k' + kanbanFocused].focus();
      }
    }
  }, {
    key: 'close',
    value: function close() {
      this.setState({ selected: null });
      this.refs.table.focus();
    }
  }, {
    key: 'render3Column',
    value: function render3Column(cols) {
      var _this2 = this;

      // TODO make the model transform this to array automagically
      var _state2 = this.state,
          project = _state2.project,
          kanbanFocused = _state2.kanbanFocused;

      var colNames = project.categories.split(",");
      // pick how to do the slice
      var left = 0;
      return colNames.slice(0, 2).map(function (colName, index) {
        if (index > 0) {
          left += 33;
        }
        var isFocused = index === kanbanFocused;
        return _react2.default.createElement(
          'box',
          {
            key: index + colName + isFocused.toString(),
            height: '94%',
            width: '33%',
            left: left.toString() + "%",
            top: '0'
          },
          _react2.default.createElement('box', {
            border: { type: 'line' },
            dockBorders: true,
            height: '10%',
            width: '100%',
            top: '0',
            content: colName
          }),
          _react2.default.createElement('list', {
            ref: 'k' + index,
            dockBorders: true,
            border: { type: 'line' },
            items: cols[colName].map(function (todo, index) {
              return todo.title;
            }),
            selectedBg: isFocused ? 'blue' : 'transparent',
            mouse: true,
            keys: true,
            vi: true,
            top: '8%',
            width: '100%',
            height: '94%',
            onSelect: _this2.kanbanSelect.bind(_this2, colName)
          })
        );
      });
    }
  }, {
    key: 'kanbanSelect',
    value: function kanbanSelect(category, list, index) {
      var selected = { index: index, category: category };
      this.setState({ selected: selected });
    }
  }, {
    key: 'renderNormalMode',
    value: function renderNormalMode(rows) {
      return _react2.default.createElement('listtable', {
        ref: 'table',
        height: '95%',
        width: '100%',
        border: { type: 'line' },
        clickable: true,
        keyable: true,
        keys: true,
        vi: true,
        rows: rows,
        selectedBg: 'blue',
        style: { header: { fg: 'blue' } },
        onSelect: this.singleModeSelect.bind(this)
      });
    }
  }, {
    key: 'singleModeSelect',
    value: function singleModeSelect(list, index) {
      var selected = { index: index - 1, category: this.state.singleColSelectedCat };
      this.setState({ selected: selected });
    }
  }, {
    key: 'getView',
    value: function getView() {
      var _state3 = this.state,
          viewMode = _state3.viewMode,
          rows = _state3.rows;

      if (viewMode === viewModes.kanban) {
        return this.render3Column(rows);
      } else {
        return this.renderNormalMode(this.formatedRows());
      }
    }
  }, {
    key: 'reload',
    value: function reload() {
      // reload from db
    }
  }, {
    key: 'render',
    value: function render() {
      var selected = null;
      var data = null;
      if (this.state.selected !== null) {
        var _state$selected = this.state.selected,
            category = _state$selected.category,
            index = _state$selected.index;

        var row = this.state.rows[category][index];

        selected = _react2.default.createElement(_todoForm2.default, {
          ref: 'modalForm',
          close: this.close.bind(this),
          todo: row,
          reload: this.reload.bind(this)
        });
      }

      var menu = null;
      if (this.state.showMenu) {
        menu = _react2.default.createElement(
          'box',
          {
            top: '20%',
            left: '20%',
            width: '60%',
            height: '60%',
            border: { type: 'line' }
          },
          ':w'
        );
      }

      var newForm = null;
      if (this.state.showNewForm) {
        newForm = _react2.default.createElement(_todoForm2.default, {
          ref: 'modalForm',
          close: this.close.bind(this),
          todo: _db.Todo.build(),
          isNew: true,
          reload: this.reload.bind(this)
        });
      }

      return _react2.default.createElement(
        'box',
        { top: 'center',
          left: 'center',
          width: '100%',
          height: '100%',
          ref: 'container',
          style: { border: { fg: 'blue' } } },
        selected,
        menu,
        newForm,
        this.getView(),
        _react2.default.createElement(
          'box',
          { bottom: '0',
            width: '100%',
            height: '10%',
            border: { type: 'line' }
          },
          'q:quit enter:select s:settings n:new  v:toggle view m: move todo'
        )
      );
    }
  }]);

  return App;
}(_react.Component);

var viewModes = { 'kanban': 0, 'normal': 1 };
var SCREEN = void 0;

// this should be moved to sequelize code
function getCategories(todos, categories) {
  var cols = categories.reduce(function (prev, current) {
    prev[current] = [];
    return prev;
  }, {});

  todos.forEach(function (todo) {
    cols[todo.category].push(todo);
  });
  return cols;
}

function runGui(program) {
  var _this3 = this;

  var screen = _blessed2.default.screen({
    autoPadding: true,
    smartCSR: true,
    dockBorders: true,
    title: 'terminal todos',
    debug: true
  });

  // TODO make the default project stuff configurable. maybe..
  var projectName = program.project ? program.project : 'default';
  SCREEN = screen;

  screen.key(['q', 'C-c'], function (ch, key) {
    return process.exit(0);
  });

  _db.Project.findOne({ where: { name: projectName } }).then(function (p) {
    p.getTodos().then(function (todos) {
      var rows = getCategories(todos, p.categories.split(','));
      var app = (0, _reactBlessed.render)(_react2.default.createElement(App, { project: p, rows: rows }), screen);

      screen.key(['escape'], function (ch, key) {
        app.setState({ selected: null, showMenu: false, showNewForm: false });
      });

      screen.key(['s'], function (ch, key) {
        app.setState({ showMenu: !app.state.showMenu });
      });

      screen.key(['n'], function (ch, key) {
        app.setState({ showNewForm: true });
      });

      screen.key('s', function (ch, key) {
        //screen.debug(app.refs)
        app.refs.modalForm.submit();
      }.bind(_this3));

      screen.key('v', function (ch, key) {
        var newState = null;
        if (app.state.selected) {
          return;
        }
        if (app.state.viewMode === viewModes.kanban) {
          newState = viewModes.normal;
        } else {
          newState = viewModes.kanban;
        }
        app.setState({ viewMode: newState });
      }.bind(_this3));

      screen.key('l', function (ch, key) {
        if (app.state.viewMode === viewModes.kanban) {
          var focused = app.state.kanbanFocused;
          var numCategories = app.state.project.categories.split(',').length;
          focused === numCategories - 1 ? focused = 0 : focused++;
          app.setState({ kanbanFocused: focused });
        }
      });

      screen.key('h', function (ch, key) {
        if (app.state.viewMode === viewModes.kanban) {
          var focused = app.state.kanbanFocused;
          var numCategories = app.state.project.categories.split(',').length;
          focused === 0 ? focused = numCategories - 1 : focused--;
          app.setState({ kanbanFocused: focused });
        }
      });
    });
  });
}