#!/usr/bin/env babel-node
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _guiEs6 = require('./gui.es6');

var _guiEs62 = _interopRequireDefault(_guiEs6);

var _actionsJs = require('./actions.js');

var _dbJs = require('./db.js');

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function main() {
  _commander2['default'].version('0.0.1');

  _commander2['default'].command('gui').description('run the gui').option('-p --project <project>', 'start gui showing a specific project').action(_guiEs62['default']);

  _commander2['default'].command('add <title...>').description('add a todo').option('-c --category <category>', 'the assigned category', '').option('-p --project <project>', 'the project this task belongs to', '').action(_actionsJs.addTodo);

  _commander2['default'].command('done <index>').description('mark a todo as done').action(_actionsJs.markDone);

  _commander2['default'].command('edit <index> <field> <value>').description('edit a todo field value').action(_actionsJs.editTodo);

  _commander2['default'].command('list').description('list todos').option('-c --category <category>', 'filter by category', '').option('-p --project <project>', 'filter by project', '').action(_actionsJs.listTodos);

  // maybe a reason to find an alternative, subcommands aren't well documented
  // many issues on github about them
  _commander2['default'].command('project <subcommand> [args...]', 'manage projects');

  _commander2['default'].parse(process.argv);
}

_fs2['default'].access('./todos.sqlite3', function (err) {
  if (err) {
    (0, _dbJs.syncDb)(main);
  } else {
    main();
  }
});
