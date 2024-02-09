import PropTypes from 'prop-types';
import React from 'react';
import { Input, Label, Form } from 'semantic-ui-react';
import { t } from 'translate';
import DateField from './DateField';

export default function DateRangeField ({
  id,
  label,
  placeholder,
  onChange,
  value: [valueFrom, valueTo] = [],
  error,
  ...props
}) {
  return (
    <Form.Field>
      <Input className='field'>
        <DateField
          id={`${id}-from`}
          label={label}
          placeholder={t('From')}
          value={valueFrom}
          onChange={valueFrom => onChange([valueFrom, valueTo])}
          {...props}
          style={{
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0
          }}
        />
        <DateField
          id={`${id}-to`}
          label={label && '\u00a0'}
          placeholder={t('To')}
          value={valueTo}
          onChange={valueTo => onChange([valueFrom, valueTo])}
          {...props}
          style={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0
          }}
        />
      </Input>
      {error && (
        <Label basic color='red' pointing>
          {error}
        </Label>
      )}
    </Form.Field>
  );
}

DateRangeField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  value: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string])
  ),
  onChange: PropTypes.func.isRequired
};
