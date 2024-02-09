import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'semantic-ui-react';

export default function TextInput ({
  label,
  error,
  onChange = v => {},
  ...props
}) {
  return (
    <Form.Field error={error}>
      {label && <label>{label}</label>}
      <Input {...props} onChange={(e, d) => onChange(e.target.value)} />
    </Form.Field>
  );
}

TextInput.propTypes = {
  label: PropTypes.string,
  error: PropTypes.bool,
  onChange: PropTypes.func
};
