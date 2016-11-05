'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _sugar = require('sugar');

var _sugar2 = _interopRequireDefault(_sugar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ModalForm = function (_Component) {
  _inherits(ModalForm, _Component);

  function ModalForm(props) {
    _classCallCheck(this, ModalForm);

    var _this = _possibleConstructorReturn(this, (ModalForm.__proto__ || Object.getPrototypeOf(ModalForm)).call(this, props));

    _this.state = {
      todo: props.todo
    };
    return _this;
  }

  _createClass(ModalForm, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this.refs.titleField.focus();

      this.refs.modal.key(['escape'], function (ch, key) {
        _this2.props.close();
      });

      this.refs.form.on('submit', function (data) {
        _this2.save(data);
      });

      this.refs.form.on('keypress', function (el, key) {
        this.refs.form.debug('foo');
      }.bind(this));
    }
  }, {
    key: 'submit',
    value: function submit() {
      this.refs.form.submit();
    }
  }, {
    key: 'save',
    value: function save(data) {
      // this.validate(data)
      // better yet define validators on the sequelize model
      // add code to convert the time and to show error if it is invalid
      // maybe some validation for other fields
      this.props.todo.title = data.title;
      this.props.todo.save().then(function (todo) {
        this.props.reload();
        this.props.close();
      }.bind(this));
    }
  }, {
    key: 'close',
    value: function close() {
      this.props.close();
    }
  }, {
    key: 'render',
    value: function render() {
      var _props$todo = this.props.todo,
          due = _props$todo.due,
          title = _props$todo.title,
          description = _props$todo.description;
      var _props = this.props,
          isNew = _props.isNew,
          close = _props.close;


      return _react2.default.createElement(
        'box',
        {
          label: isNew ? 'New Todo' : '',
          ref: 'modal',
          top: 'center',
          left: 'center',
          width: '70%',
          height: '70%',
          padding: 1,
          border: { type: 'line' },
          onKeyPress: function onKeyPress(ch, key) {
            if (key.full === 'c') {
              close();
            }
          }
        },
        _react2.default.createElement(
          'form',
          { ref: 'form', keys: true, vi: true },
          _react2.default.createElement('textbox', {
            name: 'title',
            ref: 'titleField',
            position: { top: 0, height: 1 },
            keys: true,
            vi: true,
            style: { bg: 'gray', focus: { bg: '#ff0000' } },
            value: title
          }),
          _react2.default.createElement('textarea', {
            name: 'description',
            position: { top: 2, width: '100%', height: 10 },
            style: { bg: 'gray', focus: { bg: '#ff0000' } },
            inputOnFocus: true,
            vi: true,
            keys: true,
            value: description
          }),
          _react2.default.createElement('text', {
            position: { top: 13, width: '20%' },
            content: 'due'
          }),
          _react2.default.createElement('textbox', {
            position: { top: 13, width: '80%', height: 2, left: '20%' },
            style: { bg: 'gray', focus: { bg: '#ff0000' } },
            keys: true,
            vi: true,
            value: due ? new _sugar2.default.Date(due).format('%Y-%m-%d').raw : due
          }),
          _react2.default.createElement('button', {
            position: { bottom: 0, left: '10', width: '50%', height: 3 },
            style: { focus: { bg: '#ff0000' } },
            border: { type: 'line' },
            keys: true,
            vi: true,
            content: ' Close ',
            onPress: this.close.bind(this)
          }),
          _react2.default.createElement('button', {
            position: { top: 20, width: '50%', left: '50%', height: 3 },
            style: { focus: { bg: '#ff0000' } },
            border: { type: 'line' },
            keys: true,
            vi: true,
            content: ' Save ',
            onPress: this.submit.bind(this)
          })
        )
      );
    }
  }]);

  return ModalForm;
}(_react.Component);

exports.default = ModalForm;