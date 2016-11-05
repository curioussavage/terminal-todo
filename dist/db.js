'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.syncDb = exports.Todo = exports.Project = exports.db = undefined;

var _sqlite = require('sqlite3');

var _sqlite2 = _interopRequireDefault(_sqlite);

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var db = exports.db = new _sequelize2.default('sqlite:todos.sqlite3', {
  dialect: 'sqlite',
  storage: './todos.sqlite3',
  logging: false
});

// TODO categories really should be in their own table
// but I'm not sure how to order them *easily
// it would be nice though because I could have a default field on
// a category to tell me which category should be default in a project
// this might not matter much after all since I'm starting to think id never
// use the commands to add todos
var Project = exports.Project = db.define('Projects', {
  name: _sequelize2.default.STRING,
  categories: { type: _sequelize2.default.STRING, defaultValue: '' },
  archived: { type: _sequelize2.default.BOOLEAN, defaultValue: false }
});

var Todo = exports.Todo = db.define('Todo', {
  title: _sequelize2.default.STRING,
  description: { type: _sequelize2.default.TEXT, defaultValue: '' },
  category: { type: _sequelize2.default.STRING, defaultValue: '' },
  due: { type: _sequelize2.default.STRING, defaultValue: '' }
});

Todo.belongsTo(Project);
Project.hasMany(Todo);

var syncDb = exports.syncDb = function syncDb(cb) {
  db.sync().then(function () {
    Project.create({
      name: 'default',
      categories: 'todo,done'
    }).then(cb).catch(cb);
  });
};