import { useCallback } from 'react';
import useFormal from 'packages/use-formal';
import { getValue } from 'packages/use-formal/utils';
import { reach, getIn } from 'yup';

const enableValidationOnChange = true;

//const checkValidationOnChange = value => (enableValidationOnChange = value);
const getTestParams = ({ OPTIONS: { params } }) => params;

const resolveValue = (value, options) =>
  value && value.getValue ? value.getValue(options) : value;

export const isRequired = (schema, path, value) => {
  const field = reach(schema, path, value);
  return field && !field.spec.optional;
};

// TODO support repetition of validation rules (e.g. multiple schema.min)
const getValidationOptions = (schema, path, value) => {
  const context = getIn(schema, path, value);
  // resolve the schema with value, so that conditions can be expanded
  const resolvedSchema = context.schema.resolve({ ...context, value });
  const fieldTests = Object.assign(
    {},
    ...resolvedSchema.tests.map(getTestParams)
  );
  return Object.keys(fieldTests).reduce(
    // resolve the values in case of refs
    (acc, key) => ({ ...acc, [key]: resolveValue(fieldTests[key], context) }),
    {}
  );
};

// original useFormalWeb with 2 differences:
//   onChange takes the value to update (no assumption about event.target)
//   Expose a new getFieldProps() function to get schema and required info
export default function useFormalCustom (initialValues, config) {
  const { schema } = config;
  const formal = useFormal(initialValues, config);

  const getFormProps = useCallback(
    () => ({
      onSubmit: event => {
        event.preventDefault();
        formal.submit();
      }
    }),
    [formal]
  );

  const fieldValidate = async validationList => {
    const validateErrors = {};
    const removeNullElements = validateErrs => {
      return Object.fromEntries(
        Object.entries(validateErrs).filter(entryArray => entryArray[1])
      );
    };
    for (let i = 0; i < validationList.length; i++) {
      validateErrors[validationList[i]] = undefined;
    }
    try {
      await formal.validate(validationList);
    } catch (e) {
      for (let i = 0; i < validationList.length; i++) {
        if (e[validationList[i]])
          validateErrors[validationList[i]] = e[validationList[i]];
      }
    }
    formal.setErrors(
      removeNullElements({ ...formal.errors, ...validateErrors })
    );
  };

  const change = (field, value, dependentValidationList = []) => {
    formal.changeValue(field, value);
    const totalValidations = [field, ...dependentValidationList];
    if (enableValidationOnChange && totalValidations.length !== 0) {
      if (formal.fieldValidateTimeout[field])
        clearTimeout(formal.fieldValidateTimeout[field]);
      formal.setFieldValidateTimeout({
        ...formal.fieldValidateTimeout,
        [field]: setTimeout(async () => {
          await fieldValidate(totalValidations);
        }, 500)
      });
    }
  };
  const getFieldProps = useCallback(
    (field, dependentValidationList = []) => {
      return {
        ...formal.getFieldProps(field),
        name: field,
        id: field,
        onChange: value => {
          change(field, value, [...dependentValidationList]);
        },
        onBlur: async () => {
          if (enableValidationOnChange)
            await fieldValidate([field, ...dependentValidationList]);
        },
        // Beware that passing required to an HTML input
        // will interfere with browser built-in validation
        // FIXME should that go inside schema?
        required: isRequired(schema, field, formal.values),
        // FIXME is that leaking too much stuff?
        schema: getValidationOptions(schema, field, formal.values)
      };
    },
    // This is an exception to not block CRA update (CN-577). Do not duplicate. Properly fix this instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formal]
  );

  const getResetButtonProps = useCallback(
    () => ({
      ...formal.getResetButtonProps(),
      type: 'button',
      onClick: () => {
        formal.reset();
      }
    }),
    [formal]
  );

  const getSubmitButtonProps = useCallback(
    () => ({
      ...formal.getSubmitButtonProps(),
      type: 'submit'
    }),
    [formal]
  );

  const checkFieldIndexError = (path, index, field) => {
    if (formal.errors && field && path && index !== undefined)
      return formal.errors[`${path}[${index}].${field}`];
    else return formal.errors[`${field}`];
  };

  return {
    ...formal,
    getValue: getValue,
    change,
    fieldValidate,
    getFormProps,
    getFieldProps,
    getResetButtonProps,
    getSubmitButtonProps,
    isFieldRequired: path => isRequired(schema, path, formal.values),
    checkFieldIndexError,
    getFieldValidationOptions: path =>
      getValidationOptions(schema, path, formal.values)
  };
}
