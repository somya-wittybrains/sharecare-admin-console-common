import React from 'react';
import PropTypes from 'prop-types';
import { Form, Label, Checkbox } from 'semantic-ui-react';

export default function BooleanField ({
  required,
  error,
  onChange,
  value,
  label,
  schema,
  width,
  style,
  status = false,
  disabled = false,
  hint,
  ...props
}) {
  const handleChange = (_, { checked }) => onChange(checked);

  return (
    <Form.Field
      required={required}
      error={Boolean(error)}
      width={width}
      style={{ ...style }}
    >
      <div>
        <Checkbox
          {...props}
          label={label}
          checked={value}
          onChange={handleChange}
          radio={status}
          disabled={disabled}
        />
        {hint && (
          <small style={{ paddingTop: 10, display: 'block' }}>{hint}</small>
        )}
      </div>
      {error && (
        <Label basic color='red' pointing>
          {error}
        </Label>
      )}
    </Form.Field>
  );
}

BooleanField.propTypes = {
  error: PropTypes.string,
  required: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.bool,
  schema: PropTypes.object,
  width: PropTypes.number
};
