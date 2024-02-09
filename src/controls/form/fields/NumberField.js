import React from 'react';
import PropTypes from 'prop-types';
import StringField from './StringField';
import { Form, Icon, Label}  from 'semantic-ui-react';
import NumberInput from 'semantic-ui-react-numberinput';

const StepperField = ({required, width, label, id, labelIconProps, value, error, onChange, hint, ...props}) =>{
  return (
    <Form.Field required={required} width={width}>
      {label && <label htmlFor={id}>{label} {labelIconProps && (<Icon  {...labelIconProps}/>)} </label>}
       <NumberInput 
       id={id}
        name={id}
        {...props}
        label={label}
        value={value}
        onChange={onChange}
        error={Boolean(error)} />       
      {hint && <small style={{ display: 'block' }}>{hint}</small>}
      {error && (
        <Label basic color='red' pointing>
          {error}
        </Label>
      )}
    </Form.Field>
  );
}

export default function NumberField ({ onChange, acceptDecimal = true, type='normal', ...props }) {
  const numberRegex = acceptDecimal ? /^\s*[+-]?(\d+|\.\d+|\d+\.\d+|\d+\.)(e[+-]?\d+)?\s*$/ : /^[0-9]*$/;
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
  const handleChange = value => {
    onChange(getSanitizedNumberValue(value, props.value));
  };
  const processedProps = {
    ...props,
    value: getSanitizedNumberValue(props.value)
  };
  return (type === 'stepper'? (<StepperField onChange={handleChange} {...processedProps} />) : (<StringField onChange={handleChange} {...processedProps} />));
}

NumberField.propTypes = {
  onChange: PropTypes.func.isRequired
};
