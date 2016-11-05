import sqlite3 from 'sqlite3';
import Sequelize from 'sequelize';

export const db = new Sequelize('sqlite:todos.sqlite3', {
  dialect: 'sqlite',
  storage: './todos.sqlite3',
  logging: false,
});


// TODO categories really should be in their own table
// but I'm not sure how to order them *easily
// it would be nice though because I could have a default field on
// a category to tell me which category should be default in a project
// this might not matter much after all since I'm starting to think id never
// use the commands to add todos
export const Project = db.define('Projects', {
  name: Sequelize.STRING,
  categories: { type: Sequelize.STRING, defaultValue: '' },
  archived: { type: Sequelize.BOOLEAN, defaultValue: false }
});

export const Todo = db.define('Todo', {
  title: Sequelize.STRING,
  description: { type: Sequelize.TEXT, defaultValue: '' },
  category: { type: Sequelize.STRING, defaultValue: '' },
  due: { type: Sequelize.STRING, defaultValue: ''},
});

Todo.belongsTo(Project);
Project.hasMany(Todo);

export const syncDb = function(cb) {
  db.sync().then(function() {
    Project.create({
      name: 'default',
      categories: 'todo,done',
    }).then(cb).catch(cb);
  });
}

