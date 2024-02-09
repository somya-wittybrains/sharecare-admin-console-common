import React, { Component } from 'react';
import { TextArea, Form } from 'semantic-ui-react';

const debug = require('debug')('controls.TextAreaInput');

export default class TextAreaInput extends Component {
  constructor (props) {
    debug('constructor(%o)', props);

    super(props);
  }

  render () {
    debug('render()');

    let { label, error, onChange = v => {}, rows = 5, ...props } = this.props;

    return (
      <Form.Field small fluid error={error}>
        {label && <label>{label}</label>}
        <TextArea
          autoHeight
          rows={rows}
          style={{ width: '100%' }}
          onChange={(e, d) => onChange(d.value)}
          {...props}
        />
      </Form.Field>
    );
  }
}
