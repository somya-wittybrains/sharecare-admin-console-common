import React, { Component } from 'react';
import { Dropdown, Form } from 'semantic-ui-react';

const debug = require('debug')('controls.DropdownInput');

export default class DropdownInput extends Component {
  constructor (props) {
    debug('constructor(%o)', props);

    super(props);
  }
  render () {
    debug('render()');

    // TODO handle array input for multiple

    let {
      label,
      error,
      options = [],
      onChange = v => {},
      ...props
    } = this.props;

    options = options
      .map(({ key, value }, i) => ({ key: `${label}_${i}`, text: key, value }))
      .sort(({ key: a }, { key: b }) => a.localeCompare(b));

    if (
      !Array.isArray(props.value) &&
      options.findIndex(option => option.value === props.value) === -1
    ) {
      options = [
        { key: `${label}_existing`, text: props.value, value: props.value }
      ].concat(options);
    }

    props.options = options;
    return (
      <Form.Field error={error}>
        {label && <label>{label}</label>}
        <Dropdown
          key={label}
          fluid
          selection
          onChange={(e, d) => onChange(d.value)}
          {...props}
        />
      </Form.Field>
    );
  }
}
