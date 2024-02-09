import React from 'react';
import PropTypes from 'prop-types';
import { Label, Form, Radio, Icon } from 'semantic-ui-react';
/******

Struture of options is summarized below. Options is an array. Each element corresponds to the radio button that needs to be created
options = [
    {
      name: '',
      label: '',
      value: '',
      hint: '',
      labelIconProps:{
        name: '',
        ...props
      }
    }
  ];
  name: Indicates the name of the radio group. All radio should have the same named group 
  label: Text to show for the radio button 
  value: The value of the radio button for default selection and passed on change  
  hint: Any extra information to be shown for a particular radio button

  Also the align field in the props indicates whether to show radio vertically or horizontally possible values are 'vertical' or 'horizontal' default is 'vertical'   
******/
export default function ArrayOfBooleanField ({
  required,
  error,
  onChange,
  value,
  options,
  label,
  showElementLabel = true,
  id,
  align = 'vertical',
  schema,
  hint,
  radioGroupProps,
  fieldStyle = {},
  ...props
}) {
  const handleChange = (e, { value }) => onChange(value);

  return (
    <Form.Field required={required} error={Boolean(error)} style={fieldStyle}>
      {label && <label htmlFor={id}>{label}</label>}
      <Form.Group
        {...radioGroupProps}
        style={{
          display: align === 'vertical' ? 'inline' : 'flex'
        }}
      >
        {options.map((element, index) => {
          return (
            <Form.Field key={index} style={fieldStyle}>
              {showElementLabel && label && <label>{element.label}</label>}
              <Radio
                label={element.label}
                name={element.name}
                value={element.value}
                checked={element.value === value}
                onChange={handleChange}
                {...props}
              />
              {element.labelIconProps && <Icon {...element.labelIconProps} />}
              {element.hint && (
                <small style={{ display: 'block', paddingLeft: '28px' }}>
                  {element.hint}
                </small>
              )}
              {element.hints &&
                element.hints.map(hint => {
                  return (
                    <small style={{ display: 'block', paddingLeft: '28px' }}>
                      {hint}
                    </small>
                  );
                })}
            </Form.Field>
          );
        })}
      </Form.Group>
      {hint && (
        <small style={{ marginTop: -10, paddingBottom: 5, display: 'block' }}>
          {hint}
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

ArrayOfBooleanField.propTypes = {
  error: PropTypes.string,
  required: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  schema: PropTypes.object,
  options: PropTypes.array,
  label: PropTypes.string,
  id: PropTypes.string,
  align: PropTypes.string
};
