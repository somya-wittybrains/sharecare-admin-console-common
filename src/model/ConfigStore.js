import { makeObservable, observable, action, computed } from 'mobx';

const debug = require('debug')('model.ConfigStore');

export default class ConfigStore {
  @observable initialized = false;
  @observable baseHost = '';
  @observable ssoMethod = 'direct';
  @observable ssoHost = '';
  @observable ssoId = '';
  @observable siteUrl = '';
  @observable siteName = '';
  @observable eligibilityHost = '';
  @observable walkMeURI = '';
  @observable siteSupport = {
    email: '',
    phoneNumber: '',
    url: '',
    notes: ''
  };
  @observable multiSponsor = false;
  @observable allSponsor = false;
  @observable sponsor = '';
  @observable sponsors = [];
  @observable cloudName = '';
  @observable version = '';
  restStore = null;

  constructor(restStore) {
    debug('constructor(%o)', restStore);
    makeObservable(this);  
    this.restStore = restStore;
  }

  @computed
  get sponsorId() {
    return this.sponsor
      ? this.sponsor.substr(this.sponsor.lastIndexOf('/') + 1)
      : '';
  }

  @action
  isAdvocacySite() {
    if (window.location.href.indexOf('advocacy.') !== -1) return true;
    return false;
  }

  @computed
  get siteId() {
    return this.siteUrl
      ? this.siteUrl.substr(this.siteUrl.lastIndexOf('/') + 1)
      : '';
  }

  @action
  setConfigBasedOnUserAccess(sponsors) {
    if (!this.allSponsor) {
      const restricitedSponsors = this.sponsors.filter(
        ({ URL }) =>
          sponsors.length === 0 ||
          sponsors.find(({ URL: userSponsorURL }) => userSponsorURL === URL)
      );
      this.multiSponsor = restricitedSponsors.length > 1;
      this.sponsors = restricitedSponsors;
    }
  }

  @action
  init() {
    if(this.initialized)
      return Promise.resolve();
    return this.restStore.fetch('/api/configs', { skipRefresh: true }).then(
      action(
        ({
          BASE_HOST,
          SSO_METHOD,
          SSO_HOST,
          SSO_CLIENT,
          CLOUDINARY_CLOUD_NAME,
          SITE,
          SITE_NAME,
          SITE_SUPPORT,
          MULTISPONSOR = false,
          ALLSPONSOR = false,
          SPONSOR = '',
          SPONSORS = [],
          version,
          WALK_ME_URI
        }) => {
          this.baseHost = BASE_HOST;
          this.ssoMethod = SSO_METHOD;
          this.ssoHost = SSO_HOST;
          this.ssoId = SSO_CLIENT;
          this.cloudName = CLOUDINARY_CLOUD_NAME;
          this.siteUrl = SITE;
          this.siteName = SITE_NAME;
          this.siteSupport = SITE_SUPPORT;
          this.multiSponsor = MULTISPONSOR;
          this.allSponsor = ALLSPONSOR;
          this.sponsor = SPONSOR;
          this.walkMeURI = WALK_ME_URI;
          this.sponsors = SPONSORS.length
            ? SPONSORS.map(({ URL, NAME }) => ({
                id: URL.substr(URL.lastIndexOf('/') + 1),
                url: URL,
                name: NAME
              }))
            : [
                SPONSOR
                  ? {
                      id: SPONSOR.substr(SPONSOR.lastIndexOf('/') + 1),
                      name: SITE_NAME
                    }
                  : null
              ].filter(Boolean);
          this.version = version;
          this.initialized = true;
        }
      )
    );
  }

  @action
  destroy() {
    this.initialized = false;
    this.baseHost = '';
    this.ssoMethod = 'direct';
    this.ssoHost = '';
    this.ssoId = '';
    this.cloudName = '';
    this.siteUrl = '';
    this.siteName = '';
    this.siteSupport = { email: '', phoneNumber: '', url: '', notes: '' };
    this.multiSponsor = false;
    this.sponsor = '';
    this.sponsors = [];
  }
}
