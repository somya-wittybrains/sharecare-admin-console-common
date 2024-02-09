import React from 'react';
import { Form } from 'semantic-ui-react';
import StoreBindingComponent from './StoreBindingComponent';

const debug = require('debug')('controls.form.elements.Checkbox');

export default class Checkbox extends StoreBindingComponent {
  constructor (props) {
    debug('constructor(%o)', props);

    super(props);
  }

  render () {
    debug('render()');

    const { store, name, onChange = () => {}, ...props } = this.props;

    return (
      <React.Fragment>
        <Form.Checkbox
          toggle
          name={name}
          {...props}
          error={!!store.validationErrors[name]}
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
