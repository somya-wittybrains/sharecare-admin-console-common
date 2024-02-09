import React from 'react';
import { Form } from 'semantic-ui-react';
import StoreBindingComponent from './StoreBindingComponent';

const debug = require('debug')('controls.form.elements.Input');

export default class Input extends StoreBindingComponent {
  constructor (props) {
    debug('constructor(%o)', props);

    super(props);
  }

  render () {
    debug('render()');

    const { store, name, onChange = (e, d) => {}, ...inputProps } = this.props;
    return (
      <React.Fragment>
        <Form.Input
          inline
          name={name}
          {...inputProps}
          error={this.hasErrors(name)}
          onChange={(e, d) => {
            this.updateStore(e, d);
            onChange(e, d);
          }}
        />
        {this.renderErrors(name)}
      </React.Fragment>
    );
  }
}
