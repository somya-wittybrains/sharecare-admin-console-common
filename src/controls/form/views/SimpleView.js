import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';
import Value from './Value';

// This is the dual of a form field with a input.
// Here the goal is to view the value.
// It relies on Semantic UI primitives and is meant to be used like a form input.
export default function SimpleView ({
  label,
  value,
  control: Control,
  placeholder = '',
  required,
  disabled,
  ...props
}) {
  return (
    <Form.Field
      {...props}
      required={required}
      // FIXME should disabled view values be stricken-through?
      disabled={disabled}
      label={
        <label
          style={{
            whiteSpace: 'nowrap',
            display: 'block',
            width: '100%',
            marginRight: '1em'
          }}
        >
          {label}
        </label>
      }
      control={Control || Value}
      value={new DOMParser()?.parseFromString(value || '', 'text/html')?.body?.textContent}
      placeholder={placeholder}
    />
  );
}

SimpleView.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  placeholder: PropTypes.any,
  control: PropTypes.elementType,
  required: PropTypes.bool,
  disabled: PropTypes.bool
};
