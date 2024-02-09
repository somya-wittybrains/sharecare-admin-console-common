import { makeObservable, computed, observable, autorun, action } from 'mobx';
import { getSponsorHeader, getSubdomain } from 'utils';

const debug = require('debug')('model.SponsorStore');

export default class SponsorStore {
  @observable ALL_SPONSORS = { name: 'All Sponsors (Global)' };
  @observable selectedSponsor = null;
  @observable loading = false;
  @observable getAdvocateDetailsLoading = false;
  @observable requestedSponsor;
  @observable adminSpecificSponsors = [];
  @observable advocacySponsors = {};
  @observable specificSponsors = [];
  @observable sponsorOnboardingPortals = {};
  @observable sponsorLanaguageSupportMeta = {};
  sponsorChangeCallback = null;
  clinicalAdvocacyName = 'Clinical Advocacy';
  healthAdvocacyName = 'Family Advocacy';
  advocateRequestorType = 'Advocate';

  constructor(restStore, configStore, authStore, localesStore) {
    debug('constructor()');
    makeObservable(this);  
    this.restStore = restStore;
    this.configStore = configStore;
    this.authStore = authStore;
    this.localesStore = localesStore;

    autorun(() => {
      debug('autorun triggered for %s', authStore.sponsor);
      if (!authStore.isReady) {
        return;
      }
      let sponsor = null;
      if (!configStore.allSponsor && configStore.multiSponsor) {
        this.ALL_SPONSORS.name = `Multi-Sponsor (${this.authStore.sponsors.length})`;
      }
      if (!configStore.multiSponsor) {
        if (authStore.sponsor) {
          sponsor = configStore.sponsors.find(
            ({ url }) => url === authStore.sponsor
          );
        } else sponsor = null;
        this.sponsor = sponsor;
        this.advocacySponsors = authStore.advocacySponsors;
        this.authStore.isAdvocateUser &&
          this.getAuthUserAdvocateDetails(sessionStorage?.selectedSponsorId);
        this.getSponsorEnabledForTranslations();
      } else {
        this.advocacySponsors = authStore.advocacySponsors;
        this.getSponsorEnabledForTranslations();
        this.localesStore.getLocale(this.sponsor.id);
        // We only call if there is no sponsor in sessionStorage, because that case is handled
        // in the sponsor setter
        if (
          this.authStore.isAdvocateUser &&
          !sessionStorage.selectedSponsorId
        ) {
          this.getAuthUserAdvocateDetails(sessionStorage?.selectedSponsorId);
        }
      }
    });
  }

  processSponsorChange = sessionStorage => {
    this.setSponsor(this.requestedSponsor, sessionStorage);
  };

  cancelRequestedSponsor = () => {
    this.requestedSponsor = undefined;
  };

  sponsorName(sponsorId) {
    const sponsor = this.sponsors.find(({ id }) => id === sponsorId);
    if (sponsor) return sponsor.name;
    return null;
  }

  @computed
  get multiSponsor() {
    const multiSponsor = this.configStore.multiSponsor;

    debug('get multiSponsor() -> %s', multiSponsor);

    return multiSponsor;
  }

  @computed
  get global() {
    const global =
      this.multiSponsor &&
      (!this.authStore.sponsors.length ||
        this.authStore.sponsors.length === this.configStore.sponsors.length);

    debug('get global() -> %s', global);

    return global;
  }

  @computed
  get hasSponsor() {
    return (
      !this.multiSponsor || (this.selectedSponsor && this.selectedSponsor.id)
    );
  }

  set sponsor(sponsor) {
    debug('set sponsor(%o)', sponsor);
    let selectedSponsor;
    this.loading = true;
    // if there is no sponsor.id, autorun will handle getting the site advocates
    this.authStore.isAdvocateUser &&
      sponsor?.id &&
      this.getAuthUserAdvocateDetails(sponsor?.id);
    /*if (!this.multiSponsor) {
      this.loading = false;
      throw new Error('Cannot change sponsor for single-sponsor site');
    }*/

    if (!sponsor) {
      if (!this.multiSponsor) {
        selectedSponsor = this.authStore.sponsors.length
          ? this.sponsors[0]
          : null;
      } else {
        selectedSponsor = null;
      }
    } else {
      if (!this.configStore.sponsors.find(({ url }) => url === sponsor.url)) {
        this.loading = false;
        throw new Error('Unknown sponsor');
      }

      selectedSponsor = { ...sponsor };
    }
    if (!selectedSponsor) selectedSponsor = { ...this.ALL_SPONSORS };

    this.restStore
      .fetch('/api/auth/context', {
        method: 'POST',
        body: JSON.stringify({
          sponsor: (selectedSponsor || {}).url
        })
      })
      .then(
        action(async () => {
          if (selectedSponsor && selectedSponsor.id) {
            sessionStorage.setItem('selectedSponsorId', selectedSponsor.id);
          } else {
            sessionStorage.removeItem('selectedSponsorId');
          }
          this.selectedSponsor = selectedSponsor;
          this.localesStore
            .getLocale(selectedSponsor ? selectedSponsor.id : undefined)
            .then(() => {
              this.loading = false;
              if (this.sponsorChangeCallback) {
                this.sponsorChangeCallback(sponsor);
                this.sponsorChangeCallback = null;
              }
            });
        })
      );
  }
  @action
  getOnboardingPortals(sponsorId) {
    if (!sponsorId) return [];
    return this.sponsorOnboardingPortals[sponsorId] || [];
  }

  @computed
  get sponsor() {
    let sponsor;
    if (this.multiSponsor) {
      if (this.global || this.configStore.allSponsor) {
        sponsor = this.selectedSponsor || this.ALL_SPONSORS;
      } else {
        sponsor = this.selectedSponsor;
      }
    } else {
      /*sponsor = this.authStore.sponsors.length !== 0
        ? {
            id: this.authStore.sponsors[0].substr(
              this.authStore.sponsors[0].lastIndexOf('/') + 1
            ),
            url: this.authStore.sponsors[0],
            name: this.configStore.siteName
          }
        : null;*/
      sponsor = this.configStore.sponsor
        ? {
            id: this.configStore.sponsor.substr(
              this.configStore.sponsor.lastIndexOf('/') + 1
            ),
            url: this.configStore.sponsor,
            name: this.configStore.siteName
          }
        : null;
    }

    debug('get sponsor() -> %o', sponsor);

    return this.appendTypeFlags(sponsor);
  }

  //@action
  //setRestrictedSponsors (sponsors) {
  //  this.restricitedSponsors = sponsors;
  //}

  @computed
  get sponsors() {
    let sponsors;
    if (this.multiSponsor) {
      const uniqueSponsors = [...new Set(this.authStore.sponsors || [])];
      sponsors = !this.global
        ? uniqueSponsors.map(sponsor =>
            this.configStore.sponsors.find(({ url }) => url === sponsor)
          )
        : this.configStore.sponsors;
    } else {
      sponsors = [this.sponsor];
    }

    debug('get sponsors() -> %o', sponsors);

    return sponsors
      .filter(Boolean)
      .map(sponsor => this.appendTypeFlags(sponsor));
  }

  @computed
  get isTranslationEnabled() {
    let isTranslationEnabledFlag = false;
    const sponsorId = this.sponsor.id ? this.sponsor.id : null;
    if (this.multiSponsor) {
      if (!sponsorId && this.global) {
        isTranslationEnabledFlag = true;
      } else {
        isTranslationEnabledFlag =
          this.adminSpecificSponsors.includes(sponsorId);
      }
    } else {
      isTranslationEnabledFlag = this.specificSponsors.includes(sponsorId);
    }
    return isTranslationEnabledFlag;
  }

  getTranslationEnabledForSponsor(sponsorId) {
    let isTranslationEnabledFlag = false;
    if (this.multiSponsor) {
      if (!sponsorId && this.global) isTranslationEnabledFlag = true;
      else {
        isTranslationEnabledFlag =
          this.adminSpecificSponsors.includes(sponsorId);
      }
    } else isTranslationEnabledFlag = this.specificSponsors.includes(sponsorId);
    return isTranslationEnabledFlag;
  }

  @action
  getSponsorEnabledForTranslations() {
    debug('Enable Translations(%o,%s)');
    if (this.adminSpecificSponsors.length === 0) {
      return this.restStore
        .fetch('/api/auth/translations/meta', {
          method: 'GET'
        })
        .then(
          action(sponsor => {
            this.adminSpecificSponsors = sponsor.adminSpecificSponsors;
            this.specificSponsors = sponsor.specificSponsors;
          })
        );
    } else return Promise.resolve();
  }

  @action
  suggest({ repo = 'prod' }) {
    return Promise.resolve(
      this.sponsors.map(({ id: value, name: text }) => ({
        value,
        text
      }))
    );
  }

  @action
  setSponsor(sponsor, sessionStorage) {
    this.sponsor = this.sponsors.find(({ id }) => id === sponsor);
    if (this.sponsor && this.sponsor.id) {
      sessionStorage.setItem('selectedSponsorId', this.sponsor.id);
    } else {
      sessionStorage.removeItem('selectedSponsorId');
    }
    this.requestedSponsor = undefined;
  }

  @action
  getSponsorId = sessionStorage => {
    if (sessionStorage.getItem('selectedSponsorId')) {
      return sessionStorage.getItem('selectedSponsorId');
    }
    if (this.sponsor && this.sponsor.id) {
      return this.sponsor.id;
    }
    return undefined;
  };

  @computed
  get isAdmin() {
    return this.multiSponsor && this.global;
  }
  @action
  isCommunity(sponsorId) {
    return sponsorId && sponsorId.indexOf('CM_') === 0;
  }
  @action
  isConsumer(sponsorId) {
    return sponsorId && sponsorId.indexOf('SC_CONSUMER') === 0;
  }
  @action
  isEnterprise(sponsorId) {
    return (
      sponsorId && !this.isCommunity(sponsorId) && !this.isConsumer(sponsorId)
    );
  }
  isHealthSystem(sponsorId) {
    return sponsorId && sponsorId.indexOf('PR_') === 0;
  }
  @action
  isEmployer(sponsorId) {
    return (
      sponsorId.indexOf('ER_') === 0 &&
      !this.isCommunity(sponsorId) &&
      !this.isConsumer(sponsorId)
    );
  }
  @action
  isHealthAuthority(sponsorId) {
    return (
      sponsorId.indexOf('ER_') !== 0 &&
      !this.isCommunity(sponsorId) &&
      !this.isConsumer(sponsorId)
    );
  }
  @action
  isGlobal(sponsorId) {
    return !sponsorId;
  }

  @action
  getSponsorName = sessionStorage => {
    const selectedSponsorId = this.getSponsorId(sessionStorage);
    let sponsor;
    if (this.sponsor && selectedSponsorId !== this.sponsor.id) {
      sponsor = this.sponsors.find(({ id }) => id === selectedSponsorId);
    } else {
      sponsor = this.sponsor;
    }
    return sponsor && sponsor.name ? sponsor.name : null;
  };

  @action
  getSponsorById = sponsorId => {
    if (this.sponsors && sponsorId) {
      return this.appendTypeFlags(
        this.sponsors.find(({ id }) => sponsorId === id)
      );
    }
    return null;
  };

  @action
  getAuthUserAdvocateDetails = async sponsorOverride => {
    this.getAdvocateDetailsLoading = true;
    await this.authStore.getAdvocacyProfiles();
    this.restStore
      .fetch('/api/advocacyproxy-sf/v1/advocates/details', {
        method: 'GET',
        skip401: true,
        query: {
          subDomain: getSubdomain(),
          advocateSSOId: this.authStore.accountId
        },
        headers: {
          'account-id': this.authStore.accountId,
          'sponsor-id': sponsorOverride || getSponsorHeader(this)
        }
      })
      .then(
        action(authenticatedUserAdvocateDetails => {
          if (authenticatedUserAdvocateDetails?.advocateId) {
            Promise.all([
              this.getAdvocateGroups(
                authenticatedUserAdvocateDetails?.advocateId,
                sponsorOverride
              ),
              this.getAdvocateSpecialties(
                authenticatedUserAdvocateDetails?.advocateId,
                sponsorOverride
              )
            ])
              .then(([advocateGroups, advocateSpecialties]) => {
                this.authStore.advocateDetails = {
                  ...authenticatedUserAdvocateDetails,
                  specialties: advocateSpecialties,
                  groups: advocateGroups,
                  isClinicalAdvocate: Boolean(
                    advocateSpecialties.find(
                      advocateSpecialty =>
                        advocateSpecialty.specialtyName ===
                        this.clinicalAdvocacyName
                    )
                  ),
                  isHealthAdvocate: Boolean(
                    advocateSpecialties.find(
                      advocateSpecialty =>
                        advocateSpecialty.specialtyName ===
                        this.healthAdvocacyName
                    )
                  )
                };
                this.getAdvocateDetailsLoading = false;
              })
              .catch(() => {
                this.getAdvocateDetailsLoading = false;
              });
          } else {
            this.authStore.advocateDetails = {};
            this.getAdvocateDetailsLoading = false;
          }
        })
      )
      .catch(() => {
        this.authStore.advocateDetails = {};
        this.getAdvocateDetailsLoading = false;
      });
  };

 /*  @action
  getActivityLogs = async (sponsor, member, action = 'download') => {
    return this.restStore
      .fetch('/api/advocacyproxy-sf/v1/advocate/consent', {
        method: 'GET',
        headers: {
          'account-id': this.authStore.accountId,
          'sponsor-id': sponsor
        },
        query: {
          memberSSOId: member.id,
          action: action || 'download'
        }
      })
      .then(results => {
        return results;
      })
      .catch(() => {});
  }; */

 /*  @action
  sendActivityLogs = async (sponsor, member, activity, provider = '') => {
    return await this.restStore
      .fetch('/api/advocacyproxy-sf/v1/advocate/consent', {
        method: 'POST',
        headers: {
          'account-id': this.authStore.accountId,
          'sponsor-id': sponsor
        },
        body: JSON.stringify({
          memberSSOId: member.id,
          provider,
          activity,
          type: 'hipaa'
        })
      })
      .then(results => {
        return results;
      })
      .catch(() => {});
  };

  @action
  getHipaaConsentUrl = (sponsor, member) => {
    return this.restStore
      .fetch('/api/members/hipaaconsenturl', {
        method: 'GET',
        query: {
          sponsor,
          id: member.id
        }
      })
      .then(results => {
        this.sendActivityLogs(sponsor, member, 'send link');
        return results;
      })
      .catch(() => {});
  }; */

/*   @action
  getHipaaPDF = (sponsor, member) => {
    return this.restStore
      .fetch('/api/members/hipaaconsentpdf', {
        method: 'GET',
        query: {
          sponsor,
          id: member.id
        }
      })
      .then(results => {
        this.sendActivityLogs(sponsor, member, 'send link');
        return results;
      })
      .catch(() => {});
  }; */

  @action
  getAdvocateSpecialties = async (advocateId, sponsorOverride = false) => {
    let advocateSpecialties = [];
    await this.restStore
      .fetch(
        `/api/advocacyproxy-sf/v1/advocates/specialties?id=${advocateId}`,
        {
          method: 'GET',
          headers: {
            'account-id': this.authStore.accountId,
            'sponsor-id': sponsorOverride || getSponsorHeader(this)
          }
        }
      )
      .then(specialties => {
        advocateSpecialties = specialties;
      })
      .catch(() => {
        advocateSpecialties = [];
      });
    return advocateSpecialties;
  };

  @action
  getAdvocateGroups = async (advocateId, sponsorOverride = false) => {
    let advocateGroups = [];
    await this.restStore
      .fetch(`/api/advocacyproxy-sf/v1/advocates/groups?id=${advocateId}`, {
        method: 'GET',
        headers: {
          'account-id': this.authStore.accountId,
          'sponsor-id': sponsorOverride || getSponsorHeader(this)
        }
      })
      .then(groups => {
        advocateGroups = groups;
      })
      .catch(() => {
        advocateGroups = [];
      });
    return advocateGroups;
  };

  appendTypeFlags(sponsor) {
    return sponsor
      ? {
          ...sponsor,
          allSponsor: this.allSponsor,
          isCommunity: this.isCommunity(sponsor.id),
          isEnterprise: this.isEnterprise(sponsor.id),
          isConsumer: this.isConsumer(sponsor.id),
          isGlobal: !sponsor.id,
          isHealthSystem: this.isHealthSystem(sponsor.id)
        }
      : sponsor;
  }
}
