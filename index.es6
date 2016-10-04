import React, {Component} from 'react';
import blessed from 'blessed';
import {render} from 'react-blessed';

import program from 'commander';
import Datastore from 'nedb';

// Rendering a simple centered box
class App extends Component {
  render() {
    return (
      <box top="center"
           left="center"
           width="100%"
           height="100%"
           border={{type: 'line'}}
           style={{border: {fg: 'blue'}}}>
        <box height="90%"
             width="98%"
             border={{type: 'line'}}

        >
        poop
        </box>
        <box bottom="0"
             width="98%"
             height="10%"
             border={{type: 'line'}}
        >
          Hello world
        </box>
      </box>
    );
  }
}

let db = new Datastore({filename: __dirname + '/db', autoload: true})

program.version('0.0.1')

program.command('gui')
  .description('run the gui')
  .action(runGui)

program.command('add <title...>')
  .description('add a todo')
  .action(addTodo)

program.command('done <index>')
  .description('mark a todo as done')
  .action(markDone)

program.command('list')
  .description('list todos')
  .action(listTodos);


program.parse(process.argv);

function markDone(index) {
  db.find({done: false}, (err, docs) => {
    var id = docs[index]._id
    db.update({_id: id}, {done: true})
  })
}

function listTodos() {
 db.find({done: false}, (err, docs) => {
   docs.forEach((doc, index)=> {
    console.log(index + " - '" + doc.title + "' " + doc.created)
   });
 });
}

function Todo(title) {
  this.title = title;
  this.done = false;
  this.created = new Date();
}

Todo.prototype.toJson = () => {
  return {
    title: this.title,
    done: this.done,
    created: this.created.toString(),
  }
}

function addTodo(title) {
  title = title.join(' ');
  db.insert(new Todo(title), (err, newDocs) => {
    console.log('success', newDocs)
  })
}

function runGui() {
  const screen = blessed.screen({
    autoPadding: true,
    smartCSR: true,
    title: 'react-blessed hello world'
  });

  // Adding a way to quit the program
  screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
  });

  // Rendering the React app using our screen
  const component = render(<App />, screen);
}
