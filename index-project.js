import program from 'commander';
import { db, Todo, Project } from './db.js';
import { editProject, addProject, listProjects, archiveProject } from './actions.js';

program.command('add <name>')
  .description('add a new project')
  .option('--categories -c', 'categories')
  .action(addProject);

program.command('edit <name> <field> <value>')
  .description('edit a project')
  .action(editProject);

program.command('archive <name>')
  .description('archive a project')
  .action(archiveProject);

program.command('list')
  .description('list projects')
  .action(listProjects);

program.parse(process.argv);

