import { makeObservable, observable, computed, action, autorun } from 'mobx';
import qs from 'qs';
import {
  checkPasswordComplexity,
  isUserPasswordValid,
  getSubdomain,
  intersectAllSponsors,
  SESSION_REFRESH_DISPLAY_TIMEOUT,
  REFRESH_TIMEOUT,
  filterPermissionsOnRestrictionOrder
} from 'utils';
import YAML from 'yaml';
const debug = require('debug')('model.AuthStore');

let sessionWatchId;

class AuthStore {
  @observable reconfigurePassword = false;
  @observable isLoggedIn = false;
  @observable isLoggedOut = false;
  @observable loginFailed = false;
  @observable loading = false;
  @observable error = '';
  @observable message = '';
  @observable username = '';
  @observable firstName = '';
  @observable lastName = '';
  @observable email = '';
  @observable phoneNumber = '';
  @observable sponsor = '';
  @observable hasPassword = false;
  @observable permissions = [];
  @observable sponsors = [];
  @observable advocacySponsors = {};
  @observable advocateDetails = {};
  @observable members = [];
  @observable profileName = '';
  @observable profiles = [];
  passwordComplexity = {};
  @observable showReset = false;
  @observable showSessionError = false;
  @observable refreshed = Date.now();
  allModules = {moduleRoles: {children: []}};

  constructor(restStore, configStore) {
    debug('constructor(%o, %o)', restStore, configStore);
    makeObservable(this);  
    this.restStore = restStore; 
    this.configStore = configStore;

    autorun(() => {
      let expired = this.restStore.expired;
      let showReset = this.showReset;
      if (this.isLoggedIn && !sessionWatchId) {
        sessionWatchId = setInterval(async () => {
          if (
            this.restStore.getLastRefresh() &&
            this.restStore.getLastRefresh() + REFRESH_TIMEOUT <= Date.now()
          ) {
            this.restStore.expired = expired = true;
          }
          if (
            this.restStore.getLastRefresh() &&
            !expired &&
            this.isLoggedIn &&
            this.restStore.getLastRefresh() +
              REFRESH_TIMEOUT -
              SESSION_REFRESH_DISPLAY_TIMEOUT <=
              Date.now()
          ) {
            this.showReset = showReset = true;
            this.showSessionError = true;
          } else this.showReset = showReset = false;
          if (
            !expired &&
            this.isLoggedIn &&
            !this.showSessionError &&
            this.isAdvocateUser
          ) {
            await this.restStore.refresh();
          }
        }, 500);
      }
      if (this.isLoggedIn && expired) {
        debug('this.isLoggedIn = %s, expired = %s', this.isLoggedIn, expired);
        this.logout(true);
        return;
      }
      if (
        this.isLoggedIn &&
        !showReset &&
        Number(this.restStore.status) === 401
      ) {
        this.authenticate();
      }
    });
  }

  @action
  async getAdvocacySponsors() {
    await this.restStore
      .fetch(`/api/advocacyproxy-sf/v1/sponsors?subDomain=${getSubdomain()}`, {
        method: 'GET',
        skipRefresh: true,
        skip401: true,
        headers: {
          'account-id': this.accountId,
          'sponsor-id': this.configStore.allSponsor ? undefined : (this.sponsors.length
            ? this.sponsors
              .map(sponsor => sponsor.substring(sponsor.lastIndexOf('/') + 1))
              .toString()
            : this.configStore.sponsors.map(sponsor => sponsor.id).toString())
        }
      })
      .then(
        action(advocacySponsors => {
          // See https://arnoldmedia.jira.com/browse/ADV-1989 for details
          this.advocacySponsors = intersectAllSponsors(
            advocacySponsors,
            this.sponsors,
            this.configStore.sponsors
          );
        })
      )
      .catch(
        action(err => {
          console.log(err);
          debug(err);
        })
      );
  }

  @action
  async setFiveNineStatus(statusName) {
    try {
      const statusOptions = await this.restStore.fetch(
        '/api/advocacyproxy-five9/agent-presence-master',
        {
          method: 'GET'
        }
      );
      const statusObj =
        statusOptions.find(({ status }) => status === statusName) || {};
      if (statusObj.id) {
        const inboundResponse = await this.restStore.fetch(
          '/api/advocacyproxy-five9/agent-presence/my',
          {
            method: 'POST',
            body: JSON.stringify({
              presenceId: statusObj.id
            })
          }
        );
        if (inboundResponse.executeRestApi) {
          const interactionApi = window.Five9?.CrmSdk?.interactionApi();
          if (interactionApi) {
            await interactionApi.executeRestApi(inboundResponse.executeRestApi);
          } else {
            console.error('Five9 telephony adapter has not loaded!!!');
          }
        }
      }
    } catch (e) {}
  }

  @action
  reset() {
    this.isLoggedIn = false;
    this.reconfigurePassword = false;
    this.isLoggedOut = false;
    this.loginFailed = false;
    this.loading = false;
    this.error = '';
    this.message = '';
    this.username = '';
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.phoneNumber = '';
    this.sponsor = '';
    this.hasPassword = false;
    this.permissions = [];
    this.sponsors = [];
    this.advocacySponsors = {};
    this.members = [];
    this.profileName = '';
    this.accountId = '';
    this.passwordComplexity = {};
    this.allModules = {moduleRoles: {children: []}};
  }

  @action
  clearMessage() {
    this.message = '';
  }

  @action
  clearError() {
    this.error = '';
  }

  @computed
  get isReady() {
    return this.isLoggedIn;
  }

  @computed
  get isSupervisor() {
    return this.profileName === 'Supervisor';
  }

  @computed
  get isHealthAdvocate() {
    return this.advocateDetails?.isHealthAdvocate;
  }

  @computed
  get isClinicalAdvocate() {
    return this.advocateDetails?.isClinicalAdvocate;
  }

  getLoginURL(redirectURL, state) {
    debug('getLoginURL(%s,%s)', redirectURL, state);

    return (
      `${this.configStore.ssoHost}/oauth2/authorize?` +
      qs.stringify(
        {
          response_type: 'code',
          client_id: this.configStore.ssoId,
          redirect_uri: redirectURL,
          state
        },
        { skipNulls: true }
      )
    );
  }

  getLogoutURL(redirectURL, state) {
    debug('getLogoutURL(%s, %s)', redirectURL, state);

    if (state) {
      redirectURL += redirectURL.includes('?') ? '&' : '?';
      redirectURL += qs.stringify({ state }, { skipNulls: true });
    }

    return (
      `${this.configStore.ssoHost}/session/logout?` +
      qs.stringify(
        {
          redirect_uri: redirectURL
        },
        { skipNulls: true }
      )
    );
  }

  hasRole(module, ...roles) {
    const moduleRoles = this.permissions.find(
      moduleRoles => moduleRoles.module === module
    );

    if (moduleRoles && moduleRoles.roles) {
      return !!roles.filter(role => moduleRoles.roles.includes(role)).length;
    }
    return false;
  }

  hasAdvocactePermissions(permissions) {
    const advocacyPermissions =
      (permissions.find(p => p.module === 'advocacy') || {}).roles || [];
    return advocacyPermissions.length > 0;
  }

  @computed
  get isAdvocateUser() {
    return this.isReady && this.hasAdvocactePermissions(this.permissions);
  }

  @computed
  get modules() {
    return this.permissions
      .filter(
        ({ module, roles }) =>
          !(
            module === 'advocacy' &&
            roles.includes('CONSOLE_ADVOCACY_USERACCESS')
          )
      )
      .map(({ module }) => module);
  }

  @action
  authenticate() {
    debug('authenticate()');

    this.loading = true;
    return this.restStore
      .fetch('/api/account')
      .then(
        action(async account => {
          debug(account);
          const accountDetails = this.parseAccount(account);
          this.restStore.accountId = this.accountId = accountDetails.accountId;
          this.accountPrefix = accountDetails.accountPrefix;
          this.username = account.username;
          this.firstName = account.firstName;
          this.lastName = account.lastName;
          this.email = account.email;
          let accountUniqueIndentifier = document.getElementById('UNIQUEID');
          if (accountUniqueIndentifier) {
            accountUniqueIndentifier.value = account.email;
          }
          this.phoneNumber = account.phoneNumber;
          this.hasPassword = account.hasPassword;
          this.permissions = filterPermissionsOnRestrictionOrder(
            account.permissions,
            this.allModules
          );
          //ADV-7110 stub code
          /* const memberPermissions = this.permissions.find(({module})=>module === 'member-management');
          if (memberPermissions) {
            memberPermissions.roles = [...memberPermissions.roles, 'CONSOLE_MEMBER_DOCUMENTS_EDIT', 'CONSOLE_MEMBER_DOCUMENTS_DELETE'];
          } */
          //ADV-7110 stub code
          this.sponsors = account.sponsors;
          if (
            account.sponsor &&
            account.sponsors.length === 1 &&
            !this.configStore.multiSponsor
          ) {
            this.sponsor = account.sponsor;
          }
          this.refreshed = Date.now();
          //this.restStore.updateLastRefresh();
          // Leaving in cases advocacy.[env] supports returning multiSponsor as true
          // !Object.keys(this.advocacySponsors).length && this.configStore.multiSponsor && await this.getAdvocacySponsors()
          !Object.keys(this.advocacySponsors).length &&
            //this.configStore.multiSponsor &&
            //!this.configStore.allSponsor &&
            this.hasAdvocactePermissions(account.permissions) &&
            (await this.getAdvocacySponsors());
          if (!account.hasPassword) this.reconfigurePassword = false;
          else {
            await this.getPasswordComplexlity(accountDetails.accountId);
            this.reconfigurePassword =
              localStorage.getItem('reconfigurePassword') === 'true';
          }
          this.isLoggedIn = true;
          this.isLoggedOut = false;
          this.loginFailed = false;
          this.message = '';
          this.error = '';
          this.loading = false;
          this.showReset = false;
          this.showSessionError = false;
          this.hasAdvocactePermissions(account.permissions) && this.syncMe();
        })
      )
      .catch(err => {
        debug(err);
        this.reset();
        this.loginFailed = true;
      });
  }

  syncMe = () => {
    this.restStore
      .fetch(`/api/advocacyproxy-sf/v1/advocates/syncme?subDomain=${getSubdomain()}&ssoId=${this.accountId}`,
        {
          method: 'GET',
          skip401: true,
          headers: {
            'account-id': this.accountId,
            'sponsor-id': this.configStore.allSponsor
              ? undefined
              : this.sponsors.length
                ? this.sponsors.map(sponsor => sponsor.substring(sponsor.lastIndexOf('/') + 1)).toString()
                : this.configStore.sponsors.map(sponsor => sponsor.id).toString()
          }
        }
      )
      .then(response => response)
      .catch(err => {
        debug(err);
        return err;
      });
  };

  async getAdvocacyProfiles() {
    const profileYmlFile = await fetch('/profiles.yml');
    const profileYmlRawText = await profileYmlFile.text();

    const rawProfileData = YAML.parse(profileYmlRawText);

    const processedProfileData = Object.keys(rawProfileData).map(key => {
      const {
        'display-name': profileName,
        'display-description': profileDescription,
        'display-color': color,
        roles = []
      } = rawProfileData[key];
      return {
        id: key,
        profileName,
        profileDescription,
        color,
        modules: 'Temp',
        roles
      };
    });
    this.profiles = processedProfileData;
    return processedProfileData;
  }

  @action
  getPasswordComplexlity(id) {
    return this.restStore
      .fetch(`/api/auth/password-complexity?id=${id}`, {})
      .then(complexity => {
        this.passwordComplexity = complexity;
        return complexity;
      });
  }

  @action
  updateAccount(sponsor, updates) {
    debug('updateAccount(%s,%o)', sponsor, updates);
    this.loading = true;
    return this.restStore
      .fetch('/api/account', {
        method: 'POST',
        body: JSON.stringify(updates)
      })
      .then(
        action(async account => {
          debug(account);
          if (account.passwordSet) {
            await this.logout();
            this.message = 'Your password has been updated.  Please log in.';
          } else {
            this.username = account.username;
            this.firstName = account.firstName;
            this.lastName = account.lastName;
            this.email = account.email;
            this.phoneNumber = account.phoneNumber;
            this.hasPassword = account.hasPassword;
            this.refreshed = Date.now();
            this.message = 'Account updated.';
            this.error = '';
            this.loading = false;
          }
        })
      )
      .catch(
        action(err => {
          debug(err);
          this.message = '';
          this.loading = false;
          const match = /.*({.*})/.exec(err.message);
          if (match) {
            const doc = JSON.parse(match[1]);
            this.error = doc.error_description;
          } else {
            this.error = 'Account update failed.';
          }
        })
      );
  }

  @action
  parseAccount(account) {
    let accountId = '';
    let accountPrefix = '';
    const index = account.account.lastIndexOf('/');
    if (index !== -1) {
      accountId = account.account.substr(index + 1, account.account.length);
      accountPrefix = account.account.substr(0, index);
    }
    return { accountId, accountPrefix };
  }

  @action
  login(username, password) {
    debug('login(%s,%s)', username, password ? '<password>' : 'null');

    this.loading = true;
    localStorage.setItem('reconfigurePassword', false);
    return this.restStore
      .fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password
        }),
        skipRefresh: true
      })
      .then(
        action(async account => {
          debug(account);
          const accountDetails = this.parseAccount(account);
          this.restStore.accountId = this.accountId = accountDetails.accountId;
          this.password = password;
          this.accountPrefix = accountDetails.accountPrefix;
          this.username = account.username;
          this.firstName = account.firstName;
          this.lastName = account.lastName;
          this.email = account.email;
          this.phoneNumber = account.phoneNumber;
          this.hasPassword = account.hasPassword;
          this.permissions = filterPermissionsOnRestrictionOrder(
            account.permissions,
            this.allModules
          );
          this.sponsors = account.sponsors;
          if (
            account.sponsor &&
            account.sponsors.length === 1 &&
            !this.configStore.multiSponsor
          ) {
            this.sponsor = account.sponsor;
          }
          this.refreshed = Date.now();
          this.error = '';
          this.message = '';
          this.restStore.resetExpired();
          this.restStore.updateLastRefresh();
          !Object.keys(this.advocacySponsors).length &&
            this.hasAdvocactePermissions(account.permissions) &&
            (await this.getAdvocacySponsors());
          setTimeout(async () => {
            const rules = await this.getPasswordComplexlity(
              accountDetails.accountId
            );
            this.passwordComplexity = rules;
            const passwordComplexity = checkPasswordComplexity(password, rules);
            const isPasswordWeak = !isUserPasswordValid(
              passwordComplexity,
              rules
            );
            this.reconfigurePassword = isPasswordWeak;
            localStorage.setItem('reconfigurePassword', isPasswordWeak);
            this.showSessionError = false;
            this.loading = false;
            this.isLoggedIn = true;
            this.isLoggedOut = false;
            this.loginFailed = false;
          }, 1000);
        })
      )
      .catch(
        action(() => {
          this.message = '';
          this.error = 'Your username or password was entered incorrectly.';
          this.loading = false;
          this.loginFailed = true;
        })
      );
  }

  @action
  async logout(showSessionError = false) {
    debug('logout()');
    clearInterval(sessionWatchId);
    this.restStore.clearLastRefresh();
    this.restStore.accountId = '';
    sessionWatchId = null;
    this.showReset = false;
    this.loading = true;
    if (this.isAdvocateUser && !showSessionError) {
      await this.setFiveNineStatus('Busy (Cases & Tasks)');
    }
    return this.restStore
      .fetch('/api/auth/logout', {
        method: 'POST',
        skipRefresh: true,
        body: JSON.stringify({})
      })
      .then(
        action(() => {
          this.reset();
          this.refreshed = Date.now();
          this.restStore.clearTimeout();
          this.restStore.clearLastRefresh();
          this.isLoggedOut = true;
          this.isLoggedIn = false;
          let accountUniqueIndentifier = document.getElementById('UNIQUEID');
          if (accountUniqueIndentifier) accountUniqueIndentifier.value = '';
          this.showSessionError = showSessionError;
          this.loading = false;
        })
      )
      .catch(
        action(e => {
          this.reset();
          this.message =
            e.status === 401 ? 'You have successfully logged out.' : '';
          this.error = e.status === 401 ? '' : 'Logout attempt failed';
          this.refreshed = Date.now();
          this.restStore.clearTimeout();
          this.restStore.clearLastRefresh();
          this.isLoggedOut = true;
          this.isLoggedIn = false;
          this.loading = false;
        })
      );
  }

  @action
  forgotPassword(username) {
    debug('forgotPassword(%s)', username);

    return this.restStore
      .fetch('/api/account/resend', {
        method: 'POST',
        body: JSON.stringify({ username }),
        skipRefresh: true
      })
      .catch(() => undefined);
  }
}

export default AuthStore;

// This code block provides hooks for auth integration with Five9 (dialer).
const isTrustedOrigin = s =>
  s.startsWith('https://') && s.endsWith('.five9.com');
function sendHelperJsUrl(target) {
  const a = document.location.host.split('.');
  // Expected hostname will be SPONSOR.ENV.console.sharecare.com, except in prod where the ENV portion is omitted.
  const envDot =
    a.length === 5
      ? `${a[1]}.`
      : a[a.length - 1].split(':')[0] === 'localhost'
      ? 'qa.'
      : '';
  target.postMessage(
    {
      helperJsUrl: `https://api.${envDot}sharecare.com/advocacyproxy-five9/adt-helper.js`
    },
    'https://app.five9.com'
  );
}
window.addEventListener('message', async evt => {
  if (isTrustedOrigin(evt.origin)) {
    if (evt.data === 'helperJsUrl_get') {
      sendHelperJsUrl(evt.source);
    }
    if (evt.data === 'readyToLogIn') {
      const o = await (
        await fetch('/api/advocacyproxy-five9/sso-check')
      ).json();
      const { username, password } = o || {};
      if (username && password) {
        evt.source.postMessage(
          {
            username,
            password
          },
          'https://app.five9.com'
        );
      }
    }
  }
});
[...document.getElementsByTagName('iframe')]
  .map(o => o.contentWindow)
  .forEach(sendHelperJsUrl); // If the frame finishes loading before this loads, we will miss the helperJsUrl_get message, so go ahead and send the helper JS URL.
