import React from 'react';
import PropTypes from 'prop-types';
import { t } from 'translate';
import { Form, Label, Dropdown } from 'semantic-ui-react';

export default function SearchEnumField ({
  id,
  label,
  hint,
  error,
  required,
  placeholder = t('Search'),
  options,
  onChange,
  schema,
  onSearchChange,
  width,
  ...props
}) {
  const handleChange = (event, { value }) => onChange(value);
  const handleSearchChange = onSearchChange
    ? (_, { searchQuery }) => onSearchChange(searchQuery)
    : undefined;

  return (
    <Form.Field required={required} error={Boolean(error)} width={width}>
      {label && <label htmlFor={id}>{label}</label>}
      <Dropdown
        {...props}
        search
        selection
        onSearchChange={handleSearchChange}
        onChange={handleChange}
        placeholder={placeholder}
        options={
          options &&
          options.map(({ value, text, key }) => ({
            value,
            text: text || value,
            key: key || value
          }))
        }
      />
      {hint && <small style={{ display: 'block' }}>{hint}</small>}
      {error && (
        <Label basic color='red' pointing>
          {error}
        </Label>
      )}
    </Form.Field>
  );
}

SearchEnumField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      key: PropTypes.any,
      text: PropTypes.node
    })
  ).isRequired,
  required: PropTypes.bool,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  schema: PropTypes.object,
  onSearchChange: PropTypes.func,
  width: PropTypes.number
};
