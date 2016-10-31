import React, {Component} from 'react';
import blessed from 'blessed';
import {render} from 'react-blessed';
import sugar from 'sugar';
import { EventEmitter2 } from 'eventemitter2';

import { db, Todo, Project } from './db.js';
import TodoForm from './todoForm.es6';


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      rows: this.props.rows,
      project: this.props.project,
      selected: null,
      showMenu: false,
      showNewForm: false,
      viewMode: viewModes.normal,
      kanbanFocused: 0,
    };
  }

  formatedRows() {
    let rows = this.state.rows.map((row, index, list) => {
      var date = new sugar.Date(row.createdAt).format('%Y-%m-%d').raw
      let due = '';
      if (row.due) {
        due = new sugar.Date(row.due).format('%Y-%m-%d').raw
      }
      return [ row.title, date, due ]
    });

    rows.unshift(['Title', 'Created', 'Due'])
    return rows;
  }

  componentDidMount() {
    this.refs.table.focus();
  }

  componentDidUpdate(prevProps, prevState) {
    let { kanbanFocused, viewMode } = this.state;
    if (prevState.viewMode === viewModes.kanban &&
        viewMode === viewModes.normal) {
      this.refs.table.focus();
    } else if (prevState.viewMode === viewModes.normal &&
               viewMode === viewModes.kanban) {
      this.refs.k0.focus();
    }

    if (prevState.kanbanFocused !== kanbanFocused) {
      this.refs['k' + kanbanFocused].focus();
    }
  }

  close() {
    this.setState({ selected: null });
    this.refs.table.focus()
  }

  render3Column(cols) {
    // TODO make the model transform this to array automagically
    const { project, kanbanFocused } = this.state;
    let colNames = project.categories.split(",");
    // pick how to do the slice
    let left = 0;
    return colNames.slice(0, 2).map((colName, index) => {
      if (index > 0) { left += 33 }
      const isFocused = index === kanbanFocused;
      return (
        <box
          key={ index + colName + isFocused.toString() }
          height="94%"
          width="33%"
          left={ left.toString() + "%" }
          top="0"
        >
          <box
            border={ {type: 'line'} }
            dockBorders={true}
            height="10%"
            width="100%"
            top="0"
            content={ colName }
          />
          <list
            ref={ 'k' + index }
            dockBorders={true}
            border={ {type: 'line'} }
            items={ cols[colName] }
            selectedBg={ isFocused ? 'blue' : 'transparent' }
            mouse={true}
            keys={true}
            vi={true}
            top="8%"
            width="100%"
            height="94%"
            onSelect={ this.kanbanSelect.bind(this) }
          />
        </box>
      );
     });
  }

  kanbanSelect(list, index) {
    //let item = list.getItem(index);
    SCREEN.debug(Object.keys(list), list.content);
  }

  makeKanbanColumns(todos) {
    let cols = {};
    todos.forEach((todo) => {
      if (cols[todo.category]) {
        cols[todo.category].push(todo.title);
      } else {
       cols[todo.category] = [];
       cols[todo.category].push(todo.title);
      }
    });
    return cols;
  }

  renderNormalMode(rows) {
    return (
      <listtable
           ref="table"
           height="95%"
           width="100%"
           border={{type: 'line'}}
           clickable={true}
           keyable={true}
           keys={true}
           vi={true}
           rows={ rows }
           selectedBg='blue'
           style={{ header: {fg: 'blue'}}}
           onSelect={ (tableNode, item) => { this.setState({ selected: item - 1}) } }
      >
      </listtable>
    );
  }

  getView() {
    if (this.state.viewMode === viewModes.kanban) {
      return this.render3Column(this.makeKanbanColumns(this.state.rows));
    } else {
      return this.renderNormalMode(this.formatedRows());
    }
  }

  reload() {
    // reload from db
  }

  render() {
    let selected = null;
    let data = null;
    if (this.state.selected !== null) {
      let row = this.state.rows[this.state.selected];

      selected = (
        <TodoForm
          close={this.close.bind(this)}
          todo={ row }
          reload={ this.reload.bind(this) }
        />
      )
    }

    let menu = null;
    if (this.state.showMenu) {
      menu = (
        <box
          top="20%"
          left="20%"
          width="60%"
          height="60%"
          border={{ type: 'line' }}
        >

        </box>
      )
    }

    let newForm = null;
    if (this.state.showNewForm) {
     newForm = (
        <TodoForm
          ref="modalForm"
          close={this.close.bind(this)}
          todo={ Todo.build() }
          isNew={ true }
          reload={ this.reload.bind(this) }
        />
     );
    }

    return (
      <box top="center"
           left="center"
           width="100%"
           height="100%"
           ref="container"
           style={{border: {fg: 'blue'}}}>
        { selected }
        { menu }
        { newForm }
        { this.getView() }
        <box bottom="0"
             width="100%"
             height="10%"
             border={{type: 'line'}}
        >
        q:quit enter:select m:menu n:new  v:toggle view
        </box>
      </box>
    );
  }
}

const viewModes = { 'kanban': 0, 'normal': 1 }
let SCREEN;
initialState = {
// initial state goes here.
}

export default function runGui(program) {
  const screen = blessed.screen({
    autoPadding: true,
    smartCSR: true,
    dockBorders: true,
    title: 'terminal todos',
    debug: true,
  });

  const projectName = program.project ? program.project : 'default';
  const app = new EventEmitter2();
  app.state = Object.assign(initialState, {project: projectName});
  SCREEN = screen;

  screen.key(['q', 'C-c'], function(ch, key) {
    return process.exit(0);
  });

  Project.findOne({where: { name: projectName}}).then((p) => {
    p.getTodos().then((todos) => {
       const app = render(<App project={p} rows={todos} />, screen);

      screen.key(['escape'], function(ch, key) {
        app.setState({selected: null, showMenu: false, showNewForm: false});
       });

      screen.key(['m'], function(ch, key){
        app.setState({showMenu: !app.state.showMenu});
      });

      screen.key(['n'], function(ch, key) {
       app.setState({ showNewForm: true })
      });

      screen.key('s', function(ch, key) {
        screen.debug(app.refs)
      }.bind(this));

      screen.key('v', function(ch, key) {
        let newState = null;
        if (app.state.viewMode === viewModes.kanban) {
          newState = viewModes.normal;
        } else {
          newState = viewModes.kanban;
        }
        app.setState({ viewMode: newState });
      }.bind(this));

      screen.key('l', (ch, key) => {
        if (app.state.viewMode === viewModes.kanban) {
          let focused = app.state.kanbanFocused;
          let numCategories = app.state.project.categories.split(',').length;
          focused === numCategories - 1 ? focused = 0 : focused++
          app.setState({ kanbanFocused: focused });
        }
      });

      screen.key('h', (ch, key) => {
        if (app.state.viewMode === viewModes.kanban) {
          let focused = app.state.kanbanFocused;
          let numCategories = app.state.project.categories.split(',').length;
          focused === 0 ? focused = numCategories - 1 : focused--;
          app.setState({ kanbanFocused: focused });
        }
      });
    });
  });

}
