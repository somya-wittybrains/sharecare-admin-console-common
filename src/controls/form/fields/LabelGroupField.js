import React from 'react';
import PropTypes from 'prop-types';
import { Form, Label } from 'semantic-ui-react';
import './LabelGroupField.css';

const debug = require('debug')('controls.form.fields.LabelGroupField');

const LabelGroupField = ({ id, label, hint, value, schema, ...props }) => {
  debug('render(%s,%s,%s)', id, label, hint);

  return (
    <Form.Field className='label-group'>
      {label && <label htmlFor={id}>{label}</label>}
      {value && (
        <Label.Group>
          {value.map((v, i) => (
            <Label key={i}>{v} </Label>
          ))}
        </Label.Group>
      )}
      {hint && <small style={{ display: 'block' }}>{hint}</small>}
    </Form.Field>
  );
};

LabelGroupField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  hint: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.string),
  schema: PropTypes.object
};

export default LabelGroupField;
