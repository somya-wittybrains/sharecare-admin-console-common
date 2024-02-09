import { makeObservable, observable, action } from 'mobx';

export default class GenericStore {
  @observable loading = false;
  @observable error = '';
  @observable message = '';
  @observable lastSavedAt = null;

  constructor() {
    makeObservable(this);
  }

  @action
  clearMessageAndError() {
    this.clearMessage();
    this.clearError();
  }

  @action
  clearMessage() {
    this.message = '';
  }

  @action
  clearError() {
    this.error = '';
  }

  @action
  handleError(err) {
    const { error, validationErrors } = parseRemoteValidationErrors(err);
    this.loading = false;
    this.message = '';
    this.error = error || err.message;
    if (validationErrors) {
      err.validationErrors = validationErrors;
      // FIXME is that a good pattern?
      // It makes the form store agnostic, which is good.
      // Looks a bit strange that the store throws some errors?
      // Isn't it simpler / better to have a validationErrors on the store?
      throw err;
    }
  }
}

const parseRemoteValidationErrors = ({ error, message, body }) => {
  if (message) {
    const i = (message || '').indexOf('{');
    if (i !== -1) {
      const { error, validationErrors } = JSON.parse(message.substr(i));
      return { validationErrors, error };
    }
  }
  if (error) {
    return { error };
  }
  if(body && body.error && body.error.message){
    return {error : body.error.message}
  }
  return {};
};
