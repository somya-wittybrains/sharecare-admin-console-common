import GenericStore from 'model/GenericStore';
import { makeObservable, observable, action } from 'mobx';
import { withDelay } from 'hooks/withDelay';
import { t } from 'translate';

const debug = require('debug')('model.CompanyUserStore');

const DEFAULT_USER = () => ({
  firstName: '',
  lastName: '',
  email: '',
  permissions: [],
  sponsors: []
});

export default class CompanyUserStore extends GenericStore {
  @observable userId = '';
  @observable user = DEFAULT_USER();
  @observable errorCode;

  constructor(restStore, authStore, sponsorStore) {
    super();

    debug('constructor()');
    makeObservable(this);  
    this.restStore = restStore;
    this.sponsorStore = sponsorStore;
    this.authStore = authStore;
  }

  @action
  reset() {
    debug('reset()');

    this.userId = '_new';
    this.user = DEFAULT_USER();
    this.error = '';
    this.message = '';
    this.errorCode = null;
  }

  @action
  load(userId) {
    debug('load(%s)', userId);

    if (userId === '_new') {
      this.reset();
      this.userId = userId;
      return Promise.resolve();
    } else {
      this.loading = true;
      this.userId = userId;

      return this.restStore
        .fetch(
          `/api/site/users/${userId}?sponsorId=${this.sponsorStore.sponsor.id}&accountId=${this.authStore.accountId}&advocacySponsors=${this.authStore.advocacySponsors.string}`
        )
        .then(
          action(user => {
            debug(user);
            this.user = user;
            this.error = '';
            this.errorCode = null;
            this.message = '';
            this.loading = false;
            return user;
          })
        )
        .catch(
          action(e => {
            this.user = DEFAULT_USER;
            this.error = e.message;
            this.errorCode = e.status;
            this.message = t('User {userId} not found', { userId });
            this.loading = false;
          })
        );
    }
  }

  @action
  create(user) {
    debug('create(%o)', user);

    return this.restStore
      .fetch('/api/site/users', {
        method: 'POST',
        body: JSON.stringify(user)
      })
      .then(
        withDelay(
          1000,
          action(user => {
            this.message = 'User created';
            this.userId = user.username;
            this.user = user;
          })
        )
      )
      .catch(
        action(e => {
          this.error = e.message;
        })
      );
  }

  @action
  update(user) {
    debug('update()');

    this.loading = true;
    this.userId = user.username;

    return this.restStore
      .fetch(
        `/api/site/users/${user.username}?sponsorId=${this.sponsorStore.sponsor.id}&accountId=${this.authStore.accountId}&advocacySponsors=${this.authStore.advocacySponsors.string}`,
        {
          method: 'PATCH',
          body: JSON.stringify(user)
        }
      )
      .then(
        withDelay(
          1000,
          action(user => {
            this.loading = false;
            this.message = 'User updated';
            this.user = user;
          })
        )
      )
      .catch(
        action(e => {
          this.loading = false;
          this.error = e.message;
        })
      );
  }

  @action
  delete(user) {
    debug('delete()');

    this.loading = true;
    let accountId = '';
    let index = user.account.lastIndexOf('/');
    if (index !== -1) {
      accountId = user.account.substr(index + 1, user.account.length);
    }
    return this.restStore
      .fetch(`/api/site/users/${user.username}`, {
        method: 'DELETE',
        body: JSON.stringify(user)
      })
      .then(
        withDelay(
          1000,
          action(() => {
            this.message = `Account: ${user.firstName} ${user.lastName} (${accountId}) has been successfully deleted.`;
            this.loading = false;
          })
        )
      )
      .catch(
        action(e => {
          this.loading = false;
          this.error = e.message;
        })
      );
  }
}
