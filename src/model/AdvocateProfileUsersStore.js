import { makeObservable, observable } from 'mobx';
import GenericStore from 'model/GenericStore';
import { getSubdomain, getSponsorHeader } from 'utils';

class AdvocateProfileUsersStore extends GenericStore {
  @observable users = [];
  @observable profileData = [];
  @observable profileDataWithUsers = [];
  @observable validRoles = [];
  constructor(restStore, authStore, sponsorStore) {
    super();
    makeObservable(this);
    this.restStore = restStore;
    this.authStore = authStore;
    this.sponsorStore = sponsorStore;
  }

  reset() {
    this.users = [];
    this.profileData = [];
    this.profileDataWithUsers = [];
    this.validRoles = [];
  }

  load(profile) {
    this.loading = true;

    return this.restStore
      .fetch('/api/advocacyproxy-sf/v1/profile/advocates', {
        method: 'GET',
        skip401: true,
        query: {
          profile,
          subDomain: getSubdomain()
        },
        headers: {
          'sponsor-id': getSponsorHeader(this.sponsorStore),
          'account-id': this.authStore.accountId
        }
      })
      .then(data => {
        this.loading = false;
        this.users = data;
        return data;
      })
      .catch(err => {
        this.handleError(err);
        return [];
      });
  }

  update(profile, body) {
    this.loading = true;

    return this.restStore
      .fetch('/api/advocacyproxy-sf/v1/profile/advocates', {
        method: 'PUT',
        body: JSON.stringify(body),
        skip401: true,
        query: {
          profile,
          subDomain: getSubdomain()
        },
        headers: {
          'sponsor-id': getSponsorHeader(this.sponsorStore),
          'account-id': this.authStore.accountId
        }
      })
      .then(data => {
        this.loading = false;
        return data;
      })
      .catch(err => {
        this.handleError(err);
      });
  }

  syncAllAdvocates = () => {
    return this.restStore
      .fetch(
        `/api/advocacyproxy-sf/v1/advocates/syncalladvocates?subDomain=${getSubdomain()}&allAdvocates=1`,
        {
          method: 'GET',
          headers: {
            'account-id': this.authStore.accountId,
            'sponsor-id': getSponsorHeader(this.sponsorStore)
          }
        }
      )
      .then(response => {
        return response;
      })
      .catch(err => {
        this.handleError(err);
      });
  };
}
export default AdvocateProfileUsersStore;
