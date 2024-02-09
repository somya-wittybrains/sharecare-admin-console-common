import React from 'react';
import PropTypes from 'prop-types';
import StringField from './StringField';

export default function IntegerField ({ onChange, positive, ...props }) {
  const integerRegex = /^[-+]?\d+$/;
  const positiveIntegerRegex = /^\d*$/;

  var isNumber = s => {
    return positive ? positiveIntegerRegex.test(s) : integerRegex.test(s);
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
  return <StringField onChange={handleChange} {...processedProps} />;
}

IntegerField.propTypes = {
  onChange: PropTypes.func.isRequired,
  positive: PropTypes.bool
};
