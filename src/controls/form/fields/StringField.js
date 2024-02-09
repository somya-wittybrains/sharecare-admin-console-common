import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Label, Icon } from 'semantic-ui-react';
import { t } from 'translate';

const formatCharCount = (count, { max }) => t('{count}/{max}', { count, max });

export default function StringField ({
  id,
  label,
  hint,
  error,
  required,
  clearable = false,
  caretDown = false,
  onChange,
  onBlur = null,
  onEnter = null,
  inputLabel = undefined,
  restrict,
  value: rawValue,
  schema: { min, max } = {},
  width,
  labelIconProps = null,
  fieldStyle = {},
  showCharCount = false,
  restrictCharsToMax = false,
  trimLeadingTrailingSpaces = false,
  characterPreText = '',
  disabled = false,
  suffix,
  prefix,
  ...props
}) {
  const { component: LabelComponent, ...labelProps } = labelIconProps || {};
  const restrictExp = new RegExp(`[${restrict}]`, 'g');
  const onKeyPress = event => {
    if (onEnter && event.key === 'Enter') onEnter(event);
  };
  const handleChange = (event) => {
    const { value } = event.target;
    let processedValue = value;
    if (restrict) processedValue = value.replace(restrictExp, '');
    if (restrictCharsToMax && max && processedValue.length >= max) {
      onChange(processedValue.substr(0, max));
      return;
    }
    onChange(processedValue);
  };
  const handleBlur = event => {
    if (onBlur)
      onBlur(event);
  };

  const value = rawValue === undefined || rawValue === null ? '' : rawValue;
  const charCount = value ? value.length : 0;
  let icon = !clearable ? (
    undefined
  ) : value ? (
    <Icon name='delete' link onClick={() => onChange('')} />
  ) : (
    <Icon name='search' />
  );
  if (caretDown) icon = <Icon name='caret down' />;

  let prefixSuffixStyle = prefix ? 'prefixInput' : '';
  prefixSuffixStyle += suffix ? ' suffixInput' : '';
  return (
    <Form.Field required={required} width={width} style={fieldStyle}>
      {label && (
        <label htmlFor={id}>
          {label} {LabelComponent && <LabelComponent {...labelProps} />}
          {!LabelComponent && labelIconProps && (
            <Icon {...labelIconProps} />
          )}{' '}
        </label>
      )}
      {!prefix && !suffix && (
        <Input
          id={id}
          name={id}
          {...props}
          icon={icon}
          label={inputLabel}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          error={Boolean(error)}
          onKeyPress={onKeyPress}
          disabled={disabled}
        />
      )}
      {(prefix || suffix) && (
        <Input
          id={id}
          name={id}
          {...props}
          icon={icon}
          label={inputLabel}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          error={Boolean(error)}
          onKeyPress={onKeyPress}
          disabled={disabled}
        >
          {prefix && <Label className='basic prefixlabel'>{prefix}</Label>}
          {(prefix || suffix) && <input className={prefixSuffixStyle} />}
          {suffix && <Label className='basic suffixlabel'>{suffix}</Label>}
        </Input>
      )}

      {hint && <small style={{ display: 'block' }}>{hint}</small>}
      {max && (
        <small>
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

StringField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  clearable: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  restrict: PropTypes.string,
  schema: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  width: PropTypes.number
};
