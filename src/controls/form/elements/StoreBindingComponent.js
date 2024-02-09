import React, { Component } from 'react';
import { Message } from 'semantic-ui-react';

const debug = require('debug')('controls.form.Input');

export default class StoreBindingComponent extends Component {
  constructor (props) {
    debug('constructor(%o)', props);

    super(props);
  }

  removeFromStore (key) {
    debug('removeFromStore(%s)', key);

    this.props.store.removeAttribute(key);
  }

  updateStore (e, { name, type, checked, value }) {
    debug('updateStore(%o, {%s, %s, %s, %s}', e, name, type, checked, value);

    let newValue;
    switch (type) {
      case 'checkbox':
        newValue = checked;
        break;
      default:
        newValue = value;
        break;
    }
    this.props.store.updateAttribute(name, newValue);
  }

  getErrors (name) {
    debug('getErrors(%s)', name);

    return this.props.store.validationErrors[name];
  }

  hasErrors (name) {
    debug('hasErrors(%s)', name);

    return !!this.getErrors(name);
  }

  renderErrors (name) {
    debug('renderErrors(%s)', name);

    const errors = this.getErrors(name);
    return (
      errors &&
      errors.map((msg, i) => (
        <Message size='tiny' error compact key={`${name}_error_${i}`}>
          {msg}
        </Message>
      ))
    );
  }
}
