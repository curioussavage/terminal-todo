import React, {Component} from 'react';
import util from 'util'
import sugar from 'sugar';

export default class ModalForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todo: props.todo
    };
  }

  componentDidMount() {
    this.refs.titleField.focus()

    this.refs.form.on('submit', (data) => {
      this.save(data);
    });

  }

  submit() {
    this.refs.form.submit();
  }

  save(data) {
    // this.validate(data)
    // better yet define validators on the sequelize model
    // add code to convert the time and to show error if it is invalid
    // maybe some validation for other fields
    this.props.todo.title = data.title;
    this.props.todo.description = data.description;

    if (data.due !== '') {
      let date = new sugar.Date(data.due).raw.toString();
      this.props.todo.due = date;
      // need to handle possible errors here
      // probably alert the user
    }

    this.props.todo.save().then(function(todo) {
      this.props.reload();
      this.props.close();
    }.bind(this));
  }

  close() {
    this.props.close();
  }

  render() {
    const { due, title, description } = this.props.todo;
    const { isNew, close } = this.props;

    return (
      <box
          label={ isNew ? 'New Todo' : '' }
          ref="modal"
          top="center"
          left="center"
          width="70%"
          height="600"
          padding={1}
          border={{type: 'line'}}
          onKeyPress={(ch, key) => { if (key.full === 'c') { close() } }}
        >
        <form ref="form" keys={ true } vi={ true } >
          <textbox
            name="title"
            ref="titleField"
            position={{ top: 0, height: 1 }}
            keys={ true }
            vi={true}
            style={{ bg: 'gray' , focus: { bg: '#ff0000' } }}
            value={ title }
          />
          <text
            position={{top: 2}}
            content='description'
          />
          <textarea
            name="description"
            position={{ top: 4, width: '100%', height: 10 }}
            style={{ bg: 'gray', focus: { bg: '#ff0000' } }}
            inputOnFocus={ true }
            vi={ true }
            keys={ true }
            value={ description }
          />

          <text
            position={{ top: 15, width: '20%'  }}
            content={'due' }
          />
          <textbox
            name="due"
            position={{ top: 15, width: '80%', height: 2, left: '20%' }}
            style={{ bg: 'gray', focus: { bg: '#ff0000' } }}
            keys={ true }
            vi={ true }
            value={ due ? new sugar.Date(due).format('%Y-%m-%d').raw : due }
          />

          <button
            position={ { bottom: 0, left: '10', width: '50%', height: 3 } }
            style={{ focus: { bg: '#ff0000' } }}
            border={{type: 'line'}}
            keys={true}
            vi={true}
            content=' Close '
            onPress={ this.close.bind(this) }
          />

          <button
            position={ { bottom: 0, width: '50%', left: '50%', height: 3 } }
            style={{ focus: { bg: '#ff0000' } }}
            border={{type: 'line'}}
            keys={true}
            vi={true}
            content=' Save '
            onPress={ this.submit.bind(this) }
          />

        </form>
      </box>
    );
  }
}

