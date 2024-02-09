import { useState, useMemo, useCallback } from 'react';
import isEqual from 'react-fast-compare';
import {
  objectIsEmpty,
  schemaHasAsyncValidation,
  formatYupErrors,
  getValue,
  setValue
} from './utils';
import { cloneDeep } from 'utils';

export default function useFormal (initialValues, { schema, onSubmit }) {
  
  const [lastValues, setLastValues] = useState(cloneDeep(initialValues));
  const [values, setValues] = useState(cloneDeep(initialValues));

  const [errors, setErrors] = useState({});

  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fieldValidateTimeout, setFieldValidateTimeout] = useState({});
  const [changedTimeStamp, setChangedTimeStamp] = useState(
    new Date().getTime()
  );

  const isDirty = useMemo(
    () => changedTimeStamp && !isEqual(lastValues, values),
    [lastValues, values, changedTimeStamp]
  );

  const isValid = useMemo(() => !isDirty || objectIsEmpty(errors), [
    errors,
    isDirty
  ]);

  const changeValue = (field, value) => {
    setValue(field.split('.'), values, value);
    setChangedTimeStamp(new Date().getTime());
  };

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const validate = useCallback((validateErrors = []) => {
    if (!schema) {
      throw new Error(
        'You cannot call validate if you have not provided any schema.'
      );
    }

    return new Promise(async (resolve, reject) => {
      const isAsync = schemaHasAsyncValidation(schema, values);

      try {
        const validationMethod = isAsync ? 'validate' : 'validateSync';
        if (validateErrors.length === 0) {
          clearErrors();
        }
        if (isAsync) setIsValidating(true);
        await schema[validationMethod](values, {
          abortEarly: false
        });
        resolve({});
      } catch (error) {
        if (validateErrors.length === 0) setErrors(formatYupErrors(error));
        reject(formatYupErrors(error));
      } finally {
        if (isAsync) setIsValidating(false);
      }
    });
  }, [schema, values, clearErrors, setErrors]);

  const reset = useCallback(() => {
    setValues(cloneDeep(lastValues));
    clearErrors();
  }, [clearErrors, lastValues]);

  const submit = useCallback(async () => {
    if (schema) {
      try {
        await validate();
      } catch (error) {
        return;
      }
    }

    setIsSubmitting(true);
    await onSubmit(values);
    setLastValues(cloneDeep(values));
    setIsSubmitted(true);
    setIsSubmitting(false);
  }, [schema, validate, onSubmit, values]);

  const getFieldProps = useCallback(
    field => ({
      disabled: isSubmitting,
      value: getValue(field.split('.'), values),
      error: errors[field]
    }),
    [errors, isSubmitting, values]
  );

  const getResetButtonProps = useCallback(
    () => ({
      disabled:
        (!isDirty && objectIsEmpty(errors)) || isValidating || isSubmitting
    }),
    [errors, isDirty, isSubmitting, isValidating]
  );

  const getSubmitButtonProps = useCallback(
    () => ({
      disabled:
        (!isDirty && objectIsEmpty(errors)) || isValidating || isSubmitting
    }),
    [errors, isDirty, isSubmitting, isValidating]
  );

  return {
    isDirty,
    changedTimeStamp,
    isValid,
    isValidating,
    isSubmitting,
    isSubmitted,
    values,
    errors,
    changeValue,
    setErrors,
    clearErrors,
    validate,
    reset,
    submit,
    getFieldProps,
    getResetButtonProps,
    getSubmitButtonProps,
    setFieldValidateTimeout,
    fieldValidateTimeout
  };
}
