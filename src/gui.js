import React, {Component} from 'react';
import blessed from 'blessed';
import {render} from 'react-blessed';
import sugar from 'sugar';
import { EventEmitter2 } from 'eventemitter2';

import { db, Todo, Project } from './db.js';
import TodoForm from './todoForm';


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      rows: props.rows,
      project: props.project,
      // should maybe call this visible not selected to be more specific
      singleColSelectedCat: props.project.categories.split(',')[0],
      selected: null,
      showMenu: false,
      showNewForm: false,
      viewMode: viewModes.normal,
      kanbanFocused: 0,
      changingCategory: false,
      kanbanOffset: 0,
      kanbanMaxCols: 2,
    };
  }

  formatedRows() {
    const category = this.state.singleColSelectedCat;
    let rows = this.state.rows[category].map((row, index, list) => {
      // this should be in a model
      var date = new sugar.Date(row.createdAt).format('%Y-%m-%d').raw
      let due = '';
      if (row.due) {
        due = new sugar.Date(row.due).format('%Y-%m-%d').raw
      }
      return [row.title, date, due ]
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
    const { project, kanbanFocused, kanbanOffset, kanbanMaxCols } = this.state;
    let colNames = project.categories.split(",");
    let left = 0;

    return colNames.slice(kanbanOffset, kanbanMaxCols).map((colName, index) => {
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
            items={ cols[colName].map((todo, index) => {return todo.title}) }
            selectedBg={ isFocused ? 'blue' : 'transparent' }
            mouse={true}
            keys={true}
            vi={true}
            top="8%"
            width="100%"
            height="94%"
            onSelect={ this.kanbanSelect.bind(this, colName) }
          />
        </box>
      );
     });
  }

  kanbanSelect(category, list, index) {
    let selected = { index, category };
    this.setState({ selected: selected}); 
  }

  renderNormalMode(rows) {
    return (
      <box 
        height="80%"
        width="100%"
      >
        <box 
          top="0"
          height="50"
          width="100%"
          content={ this.state.project.name }
        />
        <listtable
             ref="table"
             height="100%"
             width="100%"
             top="60"
             border={{type: 'line'}}
             clickable={true}
             keyable={true}
             keys={true}
             vi={true}
             rows={ rows }
             selectedBg='blue'
             style={{ header: {fg: 'blue'}}}
             onSelect={ this.singleModeSelect.bind(this) }
        />
      </box>
    );
  }

  singleModeSelect(list, index) {
    let selected = { index: index - 1, category: this.state.singleColSelectedCat}
    this.setState({ selected: selected});
  }

  getView() {
    const { viewMode, rows } = this.state;
    if (viewMode === viewModes.kanban) {
      return this.render3Column(rows);
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
      let { category, index } = this.state.selected;
      let row = this.state.rows[category][index];

      selected = (
        <TodoForm
          ref='modalForm'
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
        :w
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
        q:quit enter:select s:settings n:new  v:toggle view m: move todo
        </box>
      </box>
    );
  }
}

const viewModes = { 'kanban': 0, 'normal': 1 }
let SCREEN;

// this should be moved to sequelize code
function getCategories (todos, categories) {
  let cols = categories.reduce((prev, current) => {
    prev[current] = [];
    return prev;
  }, {});

  todos.forEach((todo) => {
    cols[todo.category].push(todo);
  });
  return cols;
}

export default function runGui(program) {
  const screen = blessed.screen({
    autoPadding: true,
    smartCSR: true,
    dockBorders: true,
    title: 'terminal todos',
    debug: true,
  });

  // TODO make the default project stuff configurable. maybe..
  const projectName = program.project ? program.project : 'default';
  SCREEN = screen;

  screen.key(['q', 'C-c'], function(ch, key) {
    return process.exit(0);
  });

  Project.findOne({where: { name: projectName}}).then((p) => {
    p.getTodos().then((todos) => {
       let rows = getCategories(todos, p.categories.split(','));
       const app = render(<App project={p} rows={rows} />, screen);

      screen.key(['escape'], function(ch, key) {
        app.setState({selected: null, showMenu: false, showNewForm: false});
       });

       screen.key(['e'], function(ch, key) {
         app.refs.k0.select(1) 
       });

      screen.key(['c'], function(ch, key) {
        var mode = app.state.viewMode;
        if (mode === vewModes.kanban) {
          var id = app.state;
        } else {
        
        }

        app.setState({changingCategory: id});
      });

      screen.key(['m'], function(ch, key){
        app.setState({showMenu: !app.state.showMenu});
      });

      screen.key(['n'], function(ch, key) {
       app.setState({ showNewForm: true })
      });

      screen.key('u', function(ch, key) {
        //screen.debug(app.refs)
        app.refs.modalForm.submit()
      }.bind(this));

      screen.key('v', function(ch, key) {
        let newState = null;
        if (app.state.selected) { return; }
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
