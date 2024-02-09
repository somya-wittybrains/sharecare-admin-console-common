import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Form, Label, Input, Icon, Popup } from 'semantic-ui-react';

const debug = require('debug')('controls.form.fields.ArrayOfStringsField');

const ArrayOfStringsField = ({
  id,
  label,
  hint,
  hintAlignment = 'bottom',
  error,
  value,
  onChange,
  required,
  clearable,
  allowBulkAddition = false,
  bulkDelimiter = ',',
  disabled,
  schema,
  deleteTooltip,
  tooltipColor,
  restrict,
  ...props
}) => {
  debug(
    'render(%s,%s,%s,%s,%s,%s,%s)',
    id,
    label,
    hint,
    error,
    value,
    required,
    disabled
  );

  const restrictExp = new RegExp(`[${restrict}]`, 'g');

  const [buffer, setBuffer] = useState('');
  const inputRef = useRef(null);
  const icon =
    clearable && Boolean(buffer) ? (
      <Icon name='delete' link onClick={() => setBuffer('')} />
    ) : (
      undefined
    );

  const getFilteredData = data => {
    const uniqueArr = [...new Set(data)];
    return uniqueArr.filter(
      val =>
        val !== '' &&
        (!value ||
          value.filter(
            actual => ('' + actual).toLowerCase() === ('' + val).toLowerCase()
          ).length === 0)
    );
  };
  const handleKeyPress = event => {
    if (event.charCode === 13) {
      event.preventDefault();
      if (buffer) {
        let filteredData = [];
        if (allowBulkAddition)
          filteredData = getFilteredData(
            buffer.split(bulkDelimiter).map(val => val.trim())
          );
        else filteredData = getFilteredData([buffer.trim()]);
        onChange(value ? [...value].concat(filteredData) : filteredData);
        setBuffer('');
      }
    }
  };
  const handleBufferChange = event => {
    if (restrict) setBuffer(event?.target?.value.replace(restrictExp, ''));
    else setBuffer(event.target.value);
  };

  const handleItemDelete = index => {
    if (!isNaN(index)) {
      onChange([...value.slice(0, index), ...value.slice(index + 1)]);
      inputRef.current.focus();
    }
  };

  return (
    <Form.Field required={required} error={Boolean(error)}>
      {label && <label htmlFor={id}>{label}</label>}
      {hint && hintAlignment === 'top' && (
        <small style={{ display: 'block', paddingBottom: 10 }}>{hint}</small>
      )}
      <Input
        ref={inputRef}
        id={id}
        name={id}
        icon={icon}
        onKeyPress={handleKeyPress}
        value={buffer}
        onChange={handleBufferChange}
        disabled={disabled}
        {...props}
      />
      {hint && hintAlignment === 'bottom' && (
        <small style={{ display: 'block' }}>{hint}</small>
      )}
      {value && (
        <Label.Group style={{ marginTop: '.5em' }}>
          {value.map((v, i) => (
            <Label key={i} color={tooltipColor ? tooltipColor : undefined}>
              {v}{' '}
              {disabled ? (
                <Icon
                  name='lock'
                  size='small'
                  style={{
                    // Copy styles from .ui.label>.close.icon, .ui.label>.delete.icon
                    opacity: 0.5,
                    marginRight: 0,
                    marginLeft: '.5em'
                  }}
                />
              ) : !deleteTooltip || !tooltipColor ? (
                <Icon
                  name='delete'
                  data-value={i}
                  onClick={() => handleItemDelete(i)}
                />
              ) : (
                <Popup
                  data-value={i}
                  inverted
                  content={deleteTooltip}
                  trigger={
                    <Icon onClick={() => handleItemDelete(i)} name='delete' />
                  }
                />
              )}
            </Label>
          ))}
        </Label.Group>
      )}
      {error && (
        <Label basic color='red' pointing>
          {error}
        </Label>
      )}
    </Form.Field>
  );
};

ArrayOfStringsField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.arrayOf(PropTypes.string),
  allowBulkAddition: PropTypes.bool,
  bulkDelimiter: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  clearable: PropTypes.bool,
  schema: PropTypes.object
};

export default ArrayOfStringsField;
