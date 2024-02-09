import { makeObservable, observable, action, computed } from 'mobx';

const debug = require('debug')('model.CompanyUsersStore');

const isAdmin = user =>
  (user.roles['company-profile'] || []).indexOf('CONSOLE_COMPANY_MANAGER') !==
  -1;

export default class CompanyUsersStore {
  @observable ready = false;
  @observable loading = false;
  @observable error = '';
  @observable message = '';
  @observable adminOnly = false;
  @observable sortField = '';
  @observable sortDirection = 'ascending';
  @observable textFilter = '';
  @observable moduleFilter = '';
  @observable users = [];

  constructor(restStore) {
    debug('constructor()');
    makeObservable(this);
    this.restStore = restStore;
  }

  @computed
  get filteredUsers() {
    let users = [].concat(this.users);

    if (this.adminOnly) {
      users = users.filter(user => isAdmin(user));
    }

    if (this.textFilter) {
      users = users.filter(
        ({ username, firstName, lastName, email }) =>
          (username ? username.toLowerCase() : '').indexOf(
            this.textFilter.toLowerCase()
          ) !== -1 ||
          (firstName ? firstName.toLowerCase() : '').indexOf(
            this.textFilter.toLowerCase()
          ) !== -1 ||
          (lastName ? lastName.toLowerCase() : '').indexOf(
            this.textFilter.toLowerCase()
          ) !== -1 ||
          (email ? email.toLowerCase() : '').indexOf(
            this.textFilter.toLowerCase()
          ) !== -1
      );
    }

    if (this.moduleFilter) {
      users = users.filter(
        ({ permissions }) =>
          !!permissions.find(({ module }) => module === this.moduleFilter)
      );
    }

    if (this.sortField) {
      users.sort((a, b) =>
        this.sortDirection === 'ascending'
          ? (a[this.sortField] || '').localeCompare(b[this.sortField])
          : (b[this.sortField] || '').localeCompare(a[this.sortField])
      );
    }

    return users;
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
  toggleAdmin() {
    this.adminOnly = !this.adminOnly;
  }

  @action
  filterByText(text) {
    this.textFilter = text;
  }

  @action
  filterByModule(moduleId) {
    this.moduleFilter = moduleId;
  }

  @action
  sortBy(fieldName, direction) {
    this.sortField = fieldName;
    this.sortDirection = direction;
  }

  @action
  load() {
    debug('load()');

    this.loading = true;

    return this.restStore
      .fetch('/api/site/users')
      .then(
        action(users => {
          this.users = users;
          this.error = '';
          this.loading = false;
          this.ready = true;
        })
      )
      .catch(
        action(() => {
          this.users = [];
          this.error = 'Could not load company users';
          this.loading = false;
        })
      );
  }

  @action
  resend(user) {
    debug('resend(%o)', user);

    return this.restStore
      .fetch('/api/site/users/resend', {
        method: 'POST',
        body: JSON.stringify(user)
      })
      .then(
        action(status => {
          this.message = `Email ${status.status}`;
        })
      )
      .catch(
        action(() => {
          this.error = 'Email could not be sent';
        })
      );
  }
}
