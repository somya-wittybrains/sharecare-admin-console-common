export default function WithNestedFields ({
  formal,
  namespace: scope,
  children: renderFn
}) {
  const keys = scope.split('.');
  const { onChange, value: namespaceValue } = formal.getFieldProps(keys[0]);

  const getValue = (keys, values) => {
    if (keys.length === 1) {
      return values[keys[0]];
    } else {
      return getValue(keys.slice(1), values[keys[0]] || {});
    }
  };

  const buildValue = (keys, values, value) => {
    if (keys.length === 1) {
      return { ...values, [keys[0]]: value };
    } else {
      return {
        ...values,
        [keys[0]]: buildValue(keys.slice(1), values[keys[0]], value)
      };
    }
  };

  const getFieldProps = field => {
    return {
      disabled: formal.isSubmitting,
      value: getValue(keys.slice(1).concat(field), namespaceValue),
      error: formal.errors[`${scope}.${field}`],
      name: field,
      id: field,
      onChange: fieldValue =>
        onChange(
          buildValue(keys.slice(1).concat(field), namespaceValue, fieldValue)
        ),
      required: formal.isFieldRequired(`${scope}.${field}`),
      schema: formal.getFieldValidationOptions(`${scope}.${field}`)
    };
  };

  return renderFn({
    getFieldProps,
    // for convenience, reexpose all props of scope field
    value: namespaceValue,
    error: formal.errors[scope],
    name: scope,
    id: scope,
    onChange
  });
}
