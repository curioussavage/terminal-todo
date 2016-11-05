#!/usr/bin/env node
import runGui from './gui';
import {
  markDone,
  listTodos,
  addTodo,
  editTodo,
} from './actions.js';
import { syncDb } from './db.js';

import program from 'commander';
import fs from 'fs';

function main() {
  program.version('0.0.1')

  program.command('gui')
    .description('run the gui')
    .option('-p --project <project>', 'start gui showing a specific project')
    .action(runGui)

  program.command('add <title...>')
    .description('add a todo')
    .option('-c --category <category>', 'the assigned category', '')
    .option('-p --project <project>', 'the project this task belongs to', '')
    .action(addTodo)

  program.command('done <index>')
    .description('mark a todo as done')
    .action(markDone)

  program.command('edit <index> <field> <value>')
    .description('edit a todo field value')
    .action(editTodo)

  program.command('list')
    .description('list todos')
    .option('-c --category <category>', 'filter by category', '')
    .option('-p --project <project>', 'filter by project', '')
    .action(listTodos);

  // maybe a reason to find an alternative, subcommands aren't well documented
  // many issues on github about them
  program.command('project <subcommand> [args...]', 'manage projects')

  program.parse(process.argv);
}

main();

