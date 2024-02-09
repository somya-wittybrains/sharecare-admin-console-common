export function formatYupErrors (yupError) {
  const errors = {};

  if (typeof yupError === 'object' && yupError.hasOwnProperty('inner')) {
    for (const err of yupError.inner) {
      if (!errors[err.path]) {
        errors[err.path] = err.message;
      }
    }
  }

  return errors;
}

export function objectIsEmpty (obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }

  return true;
}

export function schemaHasAsyncValidation (schema, values) {
  try {
    schema.validateSync(values);
  } catch (error) {
    if (error.message && error.message.includes('Promise')) return true;
  }

  return false;
}

export function getValue (keys, values) {
  if (keys.length === 1) {
    return values[keys[0]];
  } else {
    return getValue(keys.slice(1), values[keys[0]] || {});
  }
}

export function buildValue (keys, values, value) {
  if (keys.length === 1) {
    return { ...values, [keys[0]]: value };
  } else {
    return {
      ...values,
      [keys[0]]: buildValue(keys.slice(1), values[keys[0]], value)
    };
  }
}

export function setValue (keys, values, value) {
  if (keys.length === 1) values[keys[0]] = value;
  else {
    if (!values[keys[0]]) values[keys[0]] = {};
    setValue(keys.slice(1), values[keys[0]], value);
  }
}
