import { makeObservable, observable, action } from 'mobx';
import GenericStore from 'model/GenericStore';
import { getMultiSiteSponsors } from '../utils';

const debug = require('debug')('model.SponsorshipsStore');

export default class SponsorshipsStore extends GenericStore {
  @observable target = {};
  @observable sponsorships = [];

  constructor(restStore, authStore, sponsorStore) {
    debug('SponsorshipsStore()');

    super();
    makeObservable(this);  
    this.restStore = restStore;
    this.sponsorStore = sponsorStore;
    this.authStore = authStore;
  }

  @action
  loadAccount(id) {
    debug('loadAccount(%s)', id);
    this.loading = true;
    const sponsor = getMultiSiteSponsors(
      this.sponsorStore.sponsor && this.sponsorStore.sponsor.id,
      this.authStore.sponsors
    );
    this.target = { id, sponsor };
    this.sponsorships = [];
    return this.restStore
      .fetch(
        `/api/members/sponsorships?${Object.entries(this.target)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')}`
      )
      .then(
        action(sponsorships => {
          this.sponsorships = sponsorships;
          this.loading = false;
          this.error = '';
          return sponsorships;
        })
      )
      .catch(
        action(err => {
          debug(err);
          this.error = err.message;
          this.loading = false;
        })
      );
  }

  @action
  loadMember(referenceId) {
    debug('loadMember(%s)', referenceId);

    this.loading = true;
    this.target = { referenceId };
    const sponsor = getMultiSiteSponsors(
      this.sponsorStore.sponsor && this.sponsorStore.sponsor.id,
      this.authStore.sponsors
    );
    this.target = { referenceId, sponsor };
    this.sponsorships = [];
    return this.restStore
      .fetch(
        `/api/members/sponsorships?${Object.entries(this.target)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')}`
      )
      .then(
        action(sponsorships => {
          this.sponsorships = sponsorships;
          this.loading = false;
          this.error = '';
          return sponsorships;
        })
      )
      .catch(
        action(err => {
          debug(err);
          this.error = err.message;
          this.loading = false;
        })
      );
  }
}
