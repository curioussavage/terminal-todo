'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; //import Todo from './model.js';


exports.addProject = addProject;
exports.listProjects = listProjects;
exports.editProject = editProject;
exports.archiveProject = archiveProject;
exports.markDone = markDone;
exports.listTodos = listTodos;
exports.editTodo = editTodo;
exports.addTodo = addTodo;

var _db = require('./db.js');

var _sugar = require('sugar');

var _sugar2 = _interopRequireDefault(_sugar);

var _columnify = require('columnify');

var _columnify2 = _interopRequireDefault(_columnify);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addProject(name, program) {
  _db.Project.create({
    name: name,
    categories: program.categories || ''
  });
}

function listProjects() {
  _db.Project.findAll().then(function (projects) {
    projects.forEach(function (p) {
      console.log(p.name);
    });
  });
}

function editProject(name, field, value) {
  _db.Project.findOne({ where: { name: name } }).then(function (project) {
    // do some validation here for categories (make sure it is a comma separated list
    project[field] = value;
    // should do due dilligence here and make sure save is successful
    project.save();
  });
}

function archiveProject(name) {
  _db.Project.findOne({ where: { name: name } }).then(function (project) {
    project.archived = true;
    project.save();
  });
}

function markDone(id) {
  _db.Todo.findOne({ id: id }).then(function (doc) {
    doc.done = true;
    doc.save();
  });
}

function listTodos(program) {
  _db.Todo.findAll({ where: { done: false } }).then(function (docs) {
    var columns = (0, _columnify2.default)(docs, {
      columns: ['id', 'title', 'createdAt', 'due'],
      minWidth: 12,
      headingTransform: function headingTransform(h) {
        return _chalk2.default.green(h.toUpperCase());
      },
      config: {
        createdAt: {
          dataTransform: function dataTransform(d) {
            return new _sugar2.default.Date(d).format('%Y-%m-%d').raw;
          },
          headingTransform: function headingTransform(h) {
            return _chalk2.default.green("CREATED");
          }
        },
        due: {
          dataTransform: function dataTransform(d) {
            if (d) {
              return new _sugar2.default.Date(d).format('%Y-%m-%d').raw;
            } else {
              return '';
            }
          }
        }
      }
    });
    console.log("Todos");
    console.log(columns);
  });
}

function editTodo(index, field, val) {
  _db.Todo.findOne({
    where: { id: index }
  }).then(function (todo) {

    if (field === 'created' || field === 'due') {
      val = new _sugar2.default.Date(val).raw.toString();
      console.log(typeof val === 'undefined' ? 'undefined' : _typeof(val));
      if (field === 'created') {
        field = 'createdAt';
      }
    }

    todo[field] = val;
    todo.save();
  });
}

function addTodo(title, p) {
  var category = !p.project && !p.category ? 'todo' : p.category || '';
  var params = {
    title: title.join(' '),
    category: category,
    created: new Date().toUTCString(),
    ProjectId: p.project || 1
  };

  var newTodo = _db.Todo.create(params).then(function (todo) {

    console.log('created');
  });
}