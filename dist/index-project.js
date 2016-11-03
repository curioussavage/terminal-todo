'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _db = require('./db.js');

var _actions = require('./actions.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.command('add <name>').description('add a new project').option('--categories -c', 'categories').action(_actions.addProject);

_commander2.default.command('edit <name> <field> <value>').description('edit a project').action(_actions.editProject);

_commander2.default.command('archive <name>').description('archive a project').action(_actions.archiveProject);

_commander2.default.command('list').description('list projects').action(_actions.listProjects);

_commander2.default.parse(process.argv);