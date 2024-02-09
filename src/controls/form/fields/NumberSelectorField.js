import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Label, Button } from 'semantic-ui-react';

export default function NumberSelectorField ({
  id,
  label,
  hint,
  error,
  required,
  onChange,
  inputLabel = undefined,
  width,
  min,
  max,
  disabled,
  ...props
}) {
  const numberRegex = /^\s*[+-]?(\d+|\.\d+|\d+\.\d+|\d+\.)(e[+-]?\d+)?\s*$/;
  var isNumber = s => {
    return numberRegex.test(s);
  };
  const getSanitizedNumberValue = (value, previousValue = undefined) => {
    if (
      value === '' ||
      value === 'NaN' ||
      value === undefined ||
      value === null
    )
      return undefined;
    const trimmedStr = ('' + value).trim();
    if (isNumber(trimmedStr)) return trimmedStr;
    else if (
      previousValue !== '' &&
      previousValue !== undefined &&
      previousValue !== null
    )
      return getSanitizedNumberValue(previousValue);
    return undefined;
  };
  const handleChange = event => {
    const { value } = event.target;
    if (!min || !max) {
      onChange(value);
      return;
    }
    const restrictExp = new RegExp(`[^${min}-${max}]`, 'g');
    const processedValue = value.replace(restrictExp, '');
    if (
      +getSanitizedNumberValue(processedValue, props.value) >= min &&
      +getSanitizedNumberValue(processedValue, props.value) <= max
    )
      onChange(getSanitizedNumberValue(processedValue, props.value));
    else onChange(props.value);
  };

  const handleAdd = () => {
    onChange(
      getSanitizedNumberValue((parseInt(props.value) || 0) + 1, props.value)
    );
  };

  const handleReduce = () => {
    onChange(getSanitizedNumberValue(parseInt(props.value) - 1, props.value));
  };

  return (
    <Form.Field required={required} width={width}>
      {label && <label htmlFor={id}>{label}</label>}
      <Form.Group style={{ margin: '0 0 1em' }}>
        <Input
          id={id}
          disabled={disabled}
          name={id}
          {...props}
          label={inputLabel}
          value={getSanitizedNumberValue(props.value) || ''}
          onChange={handleChange}
          error={Boolean(error)}
        />
        <Button.Group basic vertical>
          <Button
            type='button'
            onClick={!disabled ? handleAdd : {}}
            disabled={props.value > max - 1}
          >
            +
          </Button>
          <Button
            type='button'
            onClick={!disabled ? handleReduce : {}}
            disabled={disabled || props.value < min + 1}
          >
            -
          </Button>
        </Button.Group>
      </Form.Group>
      {hint && <small style={{ display: 'block' }}>{hint}</small>}
      {error && (
        <Label basic color='red' pointing>
          {error}
        </Label>
      )}
    </Form.Field>
  );
}

NumberSelectorField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  width: PropTypes.number
};
