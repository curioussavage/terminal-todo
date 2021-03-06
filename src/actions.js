//import Todo from './model.js';
import { db, Todo, Project } from './db.js';
import sugar from 'sugar';
import columnify from 'columnify';
import chalk from 'chalk';

export function addProject(name, program) {
  Project.create({
    name,
    categories: program.categories || '',
  });
}

export function listProjects() {
  Project.findAll().then((projects) => {
   projects.forEach((p) => {console.log(p.name)})
  });
}

export function editProject(name, field, value) {
  Project.findOne({where: {name: name}}).then((project) => {
    // do some validation here for categories (make sure it is a comma separated list
    project[field] = value;
    // should do due dilligence here and make sure save is successful
    project.save();
  });
}

export function archiveProject(name) {
  Project.findOne({where: {name: name}}).then((project) => {
    project.archived = true;
    project.save();
  });
}

export function listTodos(program) {
  // need to make some logic to search based on projects not in the final state
  // based on the categories list
 Todo.findAll({}).then((docs) => {
   let columns = columnify(docs, {
     columns: ['id', 'title','createdAt', 'due'],
     minWidth: 12,
    headingTransform: (h) => chalk.green(h.toUpperCase()),
    config: {
      createdAt: {
        dataTransform: (d) => new sugar.Date(d).format('%Y-%m-%d').raw,
        headingTransform: (h) => chalk.green("CREATED")
      },
      due: {
        dataTransform: (d) => {
          if (d) {
            return new sugar.Date(d).format('%Y-%m-%d').raw
          } else {
            return ''
          }
        }
      }
    }
   })
   console.log("Todos")
   console.log(columns)
 });
}

export function editTodo(index, field, val) {
  Todo.findOne({
    where: {id: index}
  }).then((todo) => {

    if ( field === 'created' || field === 'due') {
      val = new sugar.Date(val).raw.toString();
      if (field === 'created') { field = 'createdAt'}
    }


    todo[field] = val;
    todo.save()
  })

}

export function todoInfo(index) {
  Todo.findOne({ where: { id: index}}).then((todo) => {
    console.log(todo.title, '\n')


    console.log('description')
    console.log(todo.description)

    console.log('due')
    console.log(todo.due) 
  });
}

export function addTodo(title, p) {
  let category = !p.project && !p.category ? 'todo' : p.category || '';
  let params = {
    title: title.join(' '),
    category: category,
    created: new Date().toUTCString(),
    // the default project should be configurable
    ProjectId: p.project || 1,
  };

  const newTodo = Todo.create(params).then(function(todo) {
    console.log('created')
  });
}
