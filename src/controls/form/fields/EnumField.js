import React from 'react';
import PropTypes from 'prop-types';
import { t } from 'translate';
import { Item, Popup, Icon, Form, Label, Select } from 'semantic-ui-react';

export default function EnumField ({
  id,
  label,
  hint,
  error,
  required,
  placeholder = t('Select'),
  options,
  onChange,
  schema,
  onSearchChange,
  handleKeyPress,
  labelIconProps = null,
  iconPopupLabel = null,
  selectedItemIconProps = null,
  itemPropsSameAsSelected = false,
  search,
  width,
  value,
  fieldStyle = {},
  disabled = false,
  ...props
}) {
  const handleChange = (event, { value }) => {
    // when value is falsy (e.g. empty string when clearing a clearable input)
    // and it is not a known option, then assume the value is being removed
    if (!value && !options.find(({ value: v }) => v === value)) {
      return onChange(undefined);
    }
    onChange(value);
  };
  const handleSearchChange = onSearchChange
    ? (_, { searchQuery }) => onSearchChange(searchQuery)
    : undefined;

  const getItemText = (value, options) => {
    if (options) {
      const selectedItem = options.find(
        ({ value: itemValue }) => itemValue === value
      );
      if (selectedItem) return selectedItem.text;
    }
    return '';
  };
  const getItemIconComponent = (itemProps, text) => {
    return (
      <React.Fragment>
        {itemProps.position === 'left' && (
          <Popup
            inverted
            content={itemProps.content}
            trigger={
              <Icon
                style={{ paddingRight: 10 }}
                name={itemProps.name}
                color={itemProps.color}
              />
            }
          />
        )}
        <span>{text}</span>
        {(!itemProps.position || itemProps.position === 'right') && (
          <Popup
            inverted
            content={itemProps.content}
            trigger={
              <Icon
                style={{ float: 'right' }}
                name={itemProps.name}
                color={itemProps.color}
              />
            }
          />
        )}
      </React.Fragment>
    );
  };
  const getItemIconProps = (itemProps, value, options) => {
    if (itemProps && itemProps.content) {
      return {
        trigger: getItemIconComponent(itemProps, getItemText(value, options))
      };
    }
    return {};
  };
  return (
    <Form.Field
      required={required}
      error={Boolean(error)}
      width={width}
      style={fieldStyle}
    >
      {label && (
        <label htmlFor={id}>
          {label}{' '}
          {labelIconProps &&
            (iconPopupLabel ? (
              <Popup
                content={iconPopupLabel}
                inverted
                on={'hover'}
                trigger={<Icon {...labelIconProps} />}
              />
            ) : (
              <Icon {...labelIconProps} />
            ))}{' '}
        </label>
      )}
      <Item style={{ display: 'flex' }}>
        <Select
          {...props}
          disabled={disabled}
          search={search}
          onSearchChange={handleSearchChange}
          onChange={handleChange}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
          value={value || (value === 0 ? 0 : '')}
          options={
            options &&
            options.map(({ value, text, key, content, image, disabled }) => ({
              value,
              text: text || value,
              key: key || value,
              disabled,
              image,
              content:
                itemPropsSameAsSelected && content
                  ? getItemIconComponent(
                      { ...selectedItemIconProps, content },
                      text
                    )
                  : content
            }))
          }
          {...getItemIconProps(selectedItemIconProps, value, options)}
        />
      </Item>
      {hint && <small style={{ display: 'block' }}>{hint}</small>}
      {error && (
        <Label basic color='red' pointing>
          {error}
        </Label>
      )}
    </Form.Field>
  );
}

EnumField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      key: PropTypes.any,
      text: PropTypes.node
    })
  ).isRequired,
  required: PropTypes.bool,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  schema: PropTypes.object,
  onSearchChange: PropTypes.func,
  search: PropTypes.oneOfType(PropTypes.bool, PropTypes.func),
  width: PropTypes.number
};
