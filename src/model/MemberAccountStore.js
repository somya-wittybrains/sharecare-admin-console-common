import { makeObservable, observable, action, set } from 'mobx';
import GenericStore from 'model/GenericStore';
import { withDelay } from 'hooks/withDelay';
import {
  DEFAULT_ENTITY as DEFAULT_ACCOUNT,
  computeMemberDelta
} from './member';

const debug = require('debug')('model.MemberStore');

export default class MemberAccountStore extends GenericStore {
  @observable id = '';
  @observable member = observable.object({ ...DEFAULT_ACCOUNT });
  @observable new = true;
  @observable changed = ['segments'];
  @observable badValues = [];

  constructor(restStore, authStore, sponsorStore, memberStore) {
    debug('constructor()');

    super();
    makeObservable(this);  
    this.restStore = restStore;
    this.authStore = authStore;
    this.sponsorStore = sponsorStore;
    this.memberStore = memberStore;
  }

  @action
  reset() {
    debug('reset');

    set(this.member, DEFAULT_ACCOUNT);
    this.new = true;
    this.changed.clear();
    this.changed.push('segments');
    this.error = '';
    this.id = '';
    this.validate();
  }

  @action
  load(id) {
    debug('loadAccount(%s)', id);
    // hardcoding to false as authenticated user advocateDetails can be found in the AuthStore
    const fetchAdvocateDetails = false;
    const accountId = this.authStore.accountId;
    const sponsorId = this.sponsorStore.sponsor.id;
    this.loading = true;
    this.id = id;
    return this.restStore
      .fetch(
        `/api/members/account?id=${id}&fetchAdvocateDetails=${fetchAdvocateDetails}&accountId=${accountId}${
          sponsorId ? `&sponsorId=${sponsorId}` : ''
        }&advocacySponsors=${this.authStore.advocacySponsors.string}&showSSN=${
          this.authStore.hasRole(
            'member-management',
            'CONSOLE_MEMBER_DEMOGRAPHICS_VIEW_SSN'
          )
            ? 'Y'
            : 'N'
        }`
      )
      .then(
        action(member => {
          set(this.member, member);
          this.new = false;
          this.loading = false;
          this.error = '';

          return this.member;
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
  update(member) {
    debug('update(%o)', member);

    this.loading = true;
    this.id = member.id;
    const changes = computeMemberDelta(this.memberStore.member, member);
    changes.id = member.id;
    changes.email = member.email;
    return this.restStore
      .fetch('/api/members/account', {
        method: 'POST',
        body: JSON.stringify(changes)
      })
      .then(
        withDelay(
          1000,
          action(member => {
            const transformedMember = { ...this.memberStore.member, ...member };
            set(this.member, transformedMember);
            this.memberStore.member = transformedMember;
            this.new = false;
            this.loading = false;
            this.message = 'Member account updated.';
            this.error = '';
            return member;
          })
        )
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
  create() {
    debug('create()');

    //if (!this.new) return Promise.reject(new Error('No new account to save'));
    if (this.badValues.length) {
      return Promise.reject(
        new Error(`Please correct ${this.badValues.length} data errors`)
      );
    }

    const changes = this.changed.reduce(
      (obj, key) => ({ ...obj, [key]: this.member[key] }),
      {}
    );

    return this.restStore
      .fetch('/api/account', {
        method: 'POST',
        body: JSON.stringify(changes)
      })
      .then(
        withDelay(
          1000,
          action(({ id }) => id)
        )
      )
      .catch(debug);
  }

  @action
  save() {
    debug('save()');

    /*if (this.new) {
      return Promise.reject(new Error('No existing account to save'));
    }*/
    if (!this.dirty) {
      return Promise.reject(new Error('No account changes to save'));
    }
    if (this.badValues.length) {
      return Promise.reject(
        new Error(`Please correct ${this.badValues.length} data errors`)
      );
    }

    const changes = this.changed.reduce(
      (obj, key) => ({ ...obj, [key]: this.member[key] }),
      {}
    );

    this.restStore
      .fetch(`/api/account/${this.member.id}`, {
        method: 'PATCH',
        body: JSON.stringify(changes)
      })
      .then(
        withDelay(
          1000,
          action(() => this.memberStore.loadAccount(this.memberStore.member.id))
        )
      )
      .catch(debug);
  }

  @action
  delete(message) {
    debug('delete(%s)', message);

    /*if (this.new) {
      return Promise.reject(new Error('No existing account to delete'));
    }*/
    this.loading = true;
    return this.restStore
      .fetch(`/api/account/${this.memberStore.member.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ note: message })
      })
      .then(
        withDelay(
          1000,
          action(() => {
            this.loading = false;
            this.message = `Account: ${this.memberStore.member.firstName} ${this.memberStore.member.lastName} (${this.memberStore.member.id}) has been successfully deleted.`;
            return this.memberStore.member.id;
          })
        )
      )
      .catch(e => {
        this.loading = false;
        this.handleError(e);
      });
  }

  @action
  changePassword(newPassword) {
    debug('changePassword(%s)', newPassword);

    /*if (this.new) {
      return Promise.reject(new Error('No existing account to save'));
    }*/

    return this.restStore.fetch(
      `/api/account/${this.memberStore.member.id}/password`,
      {
        method: 'PATCH',
        body: JSON.stringify({ password: newPassword })
      }
    );
  }

  @action
  deleteAvatar(accountId) {
    /*if (this.new) {
      return Promise.reject(new Error('No existing account to delete'));
    }*/

    return this.restStore
      .fetch(`/api/avatar/${accountId}`, {
        method: 'DELETE'
      })
      .then(
        action(result => {
          this.loading = false;
        })
      )
      .catch(e => {
        this.loading = false;
        this.handleError(e);
      });
  }
}
