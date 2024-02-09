import React from 'react';
import PropTypes from 'prop-types';
import { Form, TextArea, Label } from 'semantic-ui-react';
import { t } from 'translate';

const formatCharCount = (count, { max }) => t('{count}/{max}', { count, max });

export default function LongStringField ({
  id,
  label,
  hint,
  error,
  required,
  schema: { min, max } = {},
  value: rawValue,
  onChange,
  showCharCount = true,
  alignCharCountRight = false,
  restrictCharsToMax = false,
  characterPreText = '',
  trimLeadingTrailingSpaces = false,
  ...props
}) {
  const value = rawValue || '';
  const charCount = value ? value.length : 0;

  const handleChange = event => {
    const { value } = event.target;
    const charCountUpdated = value ? value.length : 0;
    if (restrictCharsToMax && max && charCountUpdated >= max) {
      onChange(value.substr(0, max));
      return;
    }
    onChange(value);
  };

  const handleBlur = event => {
    const { value } = event.target;
    if (trimLeadingTrailingSpaces)
      handleChange({ target: { value: value.trim() } });
  };

  return (
    <Form.Field required={required} error={Boolean(error)}>
      {label && <label htmlFor={id}>{label}</label>}
      <TextArea
        id={id}
        name={id}
        {...props}
        onChange={handleChange}
        onBlur={handleBlur}
        value={value}
      />
      {hint && <small>{hint}</small>}
      {max && (
        <small style={alignCharCountRight ? { float: 'right' } : {}}>
          {hint && ' '}
          {max &&
            showCharCount &&
            `${characterPreText}${formatCharCount(charCount, { min, max })}`}
        </small>
      )}
      {error && (
        <Label basic color='red' pointing>
          {error}
        </Label>
      )}
    </Form.Field>
  );
}

LongStringField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  schema: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number
  })
};
