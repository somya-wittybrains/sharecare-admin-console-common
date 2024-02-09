import { makeObservable, observable, action } from 'mobx';
import GenericStore from 'model/GenericStore';

const debug = require('debug')('model.DirectoryUsersStore');

export default class CompanyUsersStore extends GenericStore {
  @observable queryString = '';
  @observable users = [];

  constructor(restStore) {
    debug('constructor()');

    super();
    makeObservable(this);  
    this.restStore = restStore;
  }

  @action
  find(queryString) {
    debug('find(%s)', queryString);

    this.loading = true;
    this.queryString = queryString;

    return this.restStore
      .fetch(`/api/directory?queryString=${queryString}`)
      .then(
        action(users => {
          this.users = users;
          this.error = '';
          this.message = '';
          this.loading = false;
        })
      )
      .catch(
        action(() => {
          this.users = [];
          this.error = 'Could not load users';
          this.message = '';
          this.loading = false;
        })
      );
  }
}
