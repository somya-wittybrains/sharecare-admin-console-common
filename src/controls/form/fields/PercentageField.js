import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Label, Button } from 'semantic-ui-react';
import { t } from 'translate';
import './PercentageField.css';

export default function PercentageField ({
  id,
  label,
  hint,
  error,
  required,
  onChange,
  inputLabel = undefined,
  schema,
  width,
  showSign = true,
  isDecrease,
  ...props
}) {
  const numberRegex = /^\s*[+-]?(\d+|\.\d+|\d+\.\d+|\d+\.)(e[+-]?\d+)?\s*$/;
  var isNumber = s => {
    return numberRegex.test(s);
  };
  const getSanitizedNumberValue = (value, previousValue = undefined) => {
    if (value === '' || value === undefined || value === null) return undefined;
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
    onChange(getSanitizedNumberValue(value, props.value));
  };

  const handleAdd = () => {
    onChange(getSanitizedNumberValue(props.value + 1, props.value));
  };

  const handleReduce = () => {
    onChange(getSanitizedNumberValue(props.value - 1, props.value));
  };

  return (
    <Form.Field required={required} width={width}>
      {label && <label htmlFor={id}>{label}</label>}
      <Form.Group style={{ margin: '0 0 1em' }}>
        <Input
          id={id}
          name={id}
          {...props}
          label={inputLabel}
          value={getSanitizedNumberValue(props.value)}
          onChange={handleChange}
          error={Boolean(error)}
        />
        <Button.Group basic vertical>
          <Button type='button' onClick={handleAdd} disabled={props.value > 99}>
            +
          </Button>
          <Button
            type='button'
            onClick={handleReduce}
            disabled={props.value < 2}
          >
            -
          </Button>
        </Button.Group>

        {showSign && (
          <Label style={{ marginLeft: 12, lineHeight: 1.6 }}>
            {isDecrease ? t('Decrease') : t('Increase')}
          </Label>
        )}
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

PercentageField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  schema: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  width: PropTypes.number
};
