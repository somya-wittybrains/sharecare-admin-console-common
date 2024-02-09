import PropTypes from 'prop-types';
import React from 'react';
import { Input, Icon, Label, Form, Dropdown } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import './DateField.less';

// CN-490 Don't rely on moment to format old dates as
//  it does not have all DST data for accurate TZ handling.
const stringifyDate = date =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map(s => String(s).padStart(2, '0'))
    .join('-');

const InputFieldTrigger = ({
  hint,
  id,
  label,
  required,
  error,
  onClick,
  placeholder,
  ...props
}) => (
  <Form.Field
    required={required}
    onClick={onClick}
    error={Boolean(error)}
    className={'custom-date-input-field'}
  >
    {label && <label htmlFor={id}>{label}</label>}
    <Input
      {...props}
      id={id}
      iconPosition='left'
      icon='calendar'
      placeholder={placeholder}
      autoComplete='off'
      onKeyDown={event => {
        // Prevent escape event causing calender to go beserk while editing if not stopped
        // Need a better solution
        if (event.keyCode === 27) event.stopPropagation();
      }}
    />
    {hint && <small style={{ display: 'block' }}>{hint}</small>}
    {error && (
      <Label basic color='red' pointing>
        {error}
      </Label>
    )}
  </Form.Field>
);

// This one has to be a class to play well with react-datepicker
// @see https://stackoverflow.com/a/50392605
class DateFieldTrigger extends React.Component {
  render () {
    const {
      id,
      label,
      hint,
      error,
      placeholder,
      value,
      required,
      onChange,
      ...props
    } = this.props;
    const handleChange = event => onChange(event.target.value);
    const { style } = props;

    return (
      <Form.Field
        required={required}
        error={Boolean(error)}
        className={value && 'date-field with-value'}
      >
        {label && <label htmlFor={id}>{label}</label>}
        <Dropdown
          id={id}
          {...props}
          onChange={handleChange}
          className='selection'
          style={{
            whiteSpace: 'nowrap',
            ...style
          }}
          value={value}
          trigger={
            <div
              className={`text ${!value && 'default'}`}
              role='alert'
              aria-live='polite'
            >
              <Icon name='calendar' />
              {value || placeholder}
            </div>
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
}

DateFieldTrigger.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  clearable: PropTypes.bool,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClick: PropTypes.func
};

export default function DateField ({
  id,
  label,
  hint,
  error,
  required,
  placeholder,
  showTimeSelect,
  onChange,
  asString = false,
  asNumber = false,
  tz = null,
  value,
  // This info should go through the schema props
  minDate,
  maxDate,
  // semantic-ui style
  clearable = false,
  disabled = false,
  style,
  fieldStyle = {},
  schema = {},
  compact,
  setMaxSeconds = false,
  ...props
}) {
  const handleChange = value => {
    if (!value) return onChange(undefined);
    // FIXME this is a huge mess:
    // - different types could be handled by some flavor of wrapper components (DateTimeField, DateStringField ...)?
    // - formatting for display should not change how the value is handled.
    // Ultimately, it should handle values that are passed through JSON (date().toJSON() and YYYY-MM-DD)
    asString
      ? onChange(stringifyDate(value))
      : asNumber
      ? onChange(
          tz
            ? getLocalFromTZDate(moment(value).set(seconds), tz)
            : moment(value)
                .set(seconds)
                .valueOf()
        )
      : onChange(value);
  };
  const setTZDateTime = (date, tz) => {
    return moment(
      date.set(seconds).valueOf() -
        moment(date).utcOffset() * 60 * 1000 +
        moment(date)
          .tz(tz)
          .utcOffset() *
          60 *
          1000
    ).toDate();
  };

  const getLocalFromTZDate = (date, tz) => {
    return (
      date.valueOf() +
      moment().utcOffset() * 60 * 1000 -
      moment()
        .tz(tz)
        .utcOffset() *
        60 *
        1000
    );
  };

  // Most of the button props are overwritten by react-datepicker
  // @see https://github.com/Hacker0x01/react-datepicker/blob/master/src/index.jsx#L726
  const Trigger = disabled =>
    disabled ? (
      <DateFieldTrigger
        id={id}
        label={label}
        hint={hint}
        error={error}
        style={style}
        onChange={handleChange}
        compact={compact}
      />
    ) : (
      <InputFieldTrigger
        id={id}
        label={label}
        hint={hint}
        error={error}
        style={style}
        onChange={handleChange}
      />
    );
  const dateFormat = showTimeSelect ? 'MM/dd/yyyy hh:mm:ss a' : 'yyyy/MM/dd';
  const seconds = setMaxSeconds ? { seconds: 59 } : { seconds: 0 };
  const pickerValue =
    value &&
    (tz
      ? moment(value)
          .tz(tz)
          .toDate()
      : moment(value).toDate());

  const dateValue = (value, forceAsString = false) => {
    if (value) {
      if (asString || forceAsString) {
        return tz
          ? setTZDateTime(moment(value), tz)
          : moment(value)
              .utc()
              .toDate();
      }
      if (asNumber) {
        return tz
          ? setTZDateTime(moment(value), tz)
          : moment(value)
              .set(seconds)
              .toDate();
      }
      return value;
    }
    return undefined;
  };

  return (
    // This outer field is necessary so that it aligns well with Form.Group
    // react-datepicker does not allow for additional class names on its container
    <Form.Field style={fieldStyle}>
      <DatePicker
        id={id}
        dateFormat={dateFormat}
        customInput={Trigger(disabled)}
        placeholderText={placeholder}
        value={pickerValue || undefined}
        selected={dateValue(value)}
        minDate={dateValue(minDate || schema.min, true)}
        maxDate={dateValue(maxDate || schema.max, true)}
        injectTimes={[
          moment()
            .set({ hour: 23, minute: 59 })
            .toDate()
        ]}
        {...props}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        isClearable={clearable && !disabled}
        disabledKeyboardNavigation={!disabled}
        showTimeSelect={showTimeSelect}
        dropdownMode='select'
      />
    </Form.Field>
  );
}

DateField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  asString: PropTypes.bool,
  asNumber: PropTypes.bool,
  showTimeSelect: PropTypes.bool,
  tz: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string,
    PropTypes.number
  ]),
  onChange: PropTypes.func.isRequired,
  clearable: PropTypes.bool,
  compact: PropTypes.bool,
  style: PropTypes.object,
  schema: PropTypes.object,
  setMaxSeconds: PropTypes.bool
};
