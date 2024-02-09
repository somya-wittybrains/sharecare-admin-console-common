import { makeObservable, observable, action, set, remove, has, get } from 'mobx';
import _ from 'lodash';
import GenericStore from 'model/GenericStore';
import { formQueryString, getSubdomain, getSponsorHeader } from 'utils';
import { getMultiSiteSponsors } from '../utils';

const debug = require('debug')('model.MembersStore');

const ACC_TERMS = [
  'sponsor',
  'email',
  'mode',
  'queryString',
  'firstName',
  'lastName',
  'dateOfBirth',
  'gender',
  'zipCode'
];

export default class MembersStore extends GenericStore {
  // a simple lock to ensure that a slow query does not overwrite the resutls of a later query
  latest = null;

  @observable query = { mode: 'account' };
  @observable page = 1;
  @observable lastPage = 1;
  @observable accounts = [];
  @observable membersAdvocateRequests = [];
  @observable membersAdvocateRequestsLoading = false;

  constructor(restStore, authStore, sponsorStore) {
    debug('constructor()');

    super();
    makeObservable(this);  
    this.restStore = restStore;
    this.authStore = authStore;
    this.sponsorStore = sponsorStore;
  }

  debouncedSearch = _.debounce(this.doSearch, 500);

  @action
  doSearch(query, page) {
    debug('doSearch(%o,%s)', query, page);

    const now = Date.now();
    this.latest = now;

    this.restStore
      .fetch('/api/members/find', {
        method: 'POST',
        body: JSON.stringify({
          query,
          page: page - 1,
          ...{
            showSSN: this.authStore.hasRole(
              'member-management',
              'CONSOLE_MEMBER_DEMOGRAPHICS_VIEW_SSN'
            )
              ? 'Y'
              : 'N',
            accountId: this.authStore.accountId,
            sponsor: getMultiSiteSponsors(
              this.sponsorStore.sponsor && this.sponsorStore.sponsor.id,
              this.authStore.sponsors
            )
          }
        })
      })
      .then(
        action(async ({ page, lastPage, members }) => {
          if (this.authStore.isAdvocateUser && this.sponsorStore) {
            const memberSSOIds = String(members.map(member => member.id));
            this.membersAdvocateRequests =
              this.getAdvocateRequestForMembers(memberSSOIds);
          }
          if (now === this.latest) {
            this.loading = false;
            this.error = '';
            this.page = page + 1;
            this.lastPage = Math.max(page, lastPage) + 1;
            this.accounts = members;
          }
        })
      )
      .catch(
        action(err => {
          if (now === this.latest) {
            debug(err);
            this.lastPage = 1;
            this.accounts = [];
            this.loading = false;
            this.error = err.message;
          }
        })
      );
  }

  @action
  getAdvocateRequestForMembers = memberSSOIds => {
    this.membersAdvocateRequestsLoading = true;
    const sponsorId = this.sponsorStore ? this.sponsorStore.sponsor.id : '';
    const apiParams = formQueryString({
      subDomain: getSubdomain(),
      memberSSOIds,
      assigneeId: this.authStore.advocateDetails?.advocateId
    });
    let advocateRequests = null;
    this.restStore
      .fetch(`/api/advocacyproxy-sf/v2/advocaterequests/search?${apiParams}`, {
        method: 'GET',
        headers: {
          'sponsor-id': !sponsorId
            ? this.sponsorStore
              ? getSponsorHeader(this.sponsorStore)
              : ''
            : sponsorId,
          'account-id': this.authStore.accountId
        }
      })
      .then(
        action(({ page, lastPage, results }) => {
          advocateRequests = results;
          this.membersAdvocateRequests = advocateRequests;
          this.membersAdvocateRequestsLoading = false;
        })
      )
      .catch(err => {
        debug(err);
        // this.error = err.message;
        advocateRequests = { error: err };
        this.membersAdvocateRequests = [];
        this.membersAdvocateRequestsLoading = false;
      });
    return advocateRequests;
  };
  @action
  reset() {
    ACC_TERMS.forEach(term => {
      if (get(this.query, term)) remove(this.query, term);
    });
  }

  @action
  search(query, page = 1, { forceRefresh = false }) {
    debug('search(%o,%s,{forceRefresh:%s})', query, page, forceRefresh);

    let changed = true;

    ACC_TERMS.forEach(term => {
      if (query[term] !== undefined) {
        if (
          query[term] !== undefined &&
          query[term] !== get(this.query, term)
        ) {
          changed = true;
          set(this.query, term, query[term]);
        }
      } else if (has(this.query, term)) {
        changed = true;
        remove(this.query, term);
      }
    });
    if (page !== this.page) {
      changed = true;
      this.page = page;
    } else this.page = page;

    if (changed || forceRefresh) {
      this.loading = true;
      this.debouncedSearch(this.query, page);
    }
  }

  @action
  sendPasswordReset(member) {
    debug('sendPasswordReset()');

    return this.restStore
      .fetch('/api/members/account/sendReset', {
        method: 'POST',
        body: JSON.stringify(member)
      })
      .then(
        action(({ to }) => {
          this.error = '';
          this.message = `A reset password email has been submitted to the member's primary email (${to})`;
        })
      )
      .catch(
        action(err => {
          debug(err);
          this.error = err.message;
          this.message = '';
        })
      );
  }
}
