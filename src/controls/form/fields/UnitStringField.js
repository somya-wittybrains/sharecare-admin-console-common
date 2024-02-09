import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Label, Dropdown } from 'semantic-ui-react';

export default function UnitStringField ({
  id,
  label,
  hint,
  error,
  required,
  disabled,
  value,
  separator = ' ',
  options,
  onChange,
  schema,
  width,
  restrict,
  ...props
}) {
  const [number, unit = options && options[0].value] = (value || '').split(
    separator
  );
  const restrictExp = new RegExp(`[${restrict}]`, 'g');
  const handleNumberChange = (event, { value }) => {
    let processedValue = value;
    if (restrict) processedValue = value.replace(restrictExp, '');
    onChange(processedValue ?`${processedValue}${separator}${unit || ''}`:'');
  };
  const handleUnitChange = (event, { value }) =>
    onChange(`${number || ''}${separator}${value}`);
  const unitOptions =
    options &&
    options.map(({ value, text, key }) => ({
      value,
      text: text || value,
      key: key || value
    }));

  return (
    <Form.Field required={required} width={width}>
      {label && <label htmlFor={id}>{label}</label>}
      <Input
        id={id}
        name={id}
        {...props}
        onChange={handleNumberChange}
        value={number}
        error={Boolean(error)}
        disabled={disabled}
        label={
          <Dropdown
            defaultValue={unit}
            disabled={disabled}
            options={unitOptions}
            onChange={handleUnitChange}
            error={Boolean(error)}
          />
        }
        labelPosition='right'
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

UnitStringField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  separator: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      key: PropTypes.any,
      text: PropTypes.node
    })
  ).isRequired,
  schema: PropTypes.object,
  width: PropTypes.number
};
