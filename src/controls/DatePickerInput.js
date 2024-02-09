import React, { Component } from 'react';
import { Form, Input } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import './DatePickerInput.css';

const debug = require('debug')('controls.DatePickerInput');

export default class DatePickerInput extends Component {
  constructor (props) {
    debug('contructor(%o)', props);

    super(props);
  }
  render () {
    debug('render()');

    let {
      label,
      error,
      value,
      placeholder,
      onChange = v => {},
      ...props
    } = this.props;

    return (
      <Form.Field small fluid error={error}>
        {label && <label>{label}</label>}
        <DatePicker
          fluid
          dropdownMode='select'
          showMonthDropdown
          showYearDropdown
          maxDate={moment()}
          popperPlacement='top'
          placeholderText={placeholder}
          customInput={<Input value={value} {...props} />}
          selected={value || null}
          onChange={onChange}
        />
      </Form.Field>
    );
  }
}
