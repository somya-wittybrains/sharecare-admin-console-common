import { makeObservable, action, observable, set, remove, has, get } from 'mobx';
import { t } from 'translate';
import GenericStore from 'model/GenericStore';
import YAML from 'yaml';
import {
  isExternalUser,
  convertSponsorObjectArrayToSponsorIdArray
} from 'utils/advocacyUtils';
import { getSubdomain, getSponsorHeader } from 'utils';
import moment from 'moment';
import { getPermissionsFromRoles } from 'utils/advocacyProfileUtils';

const debug = require('debug')('model.AdvocatesUsersStore');

const USERS_TERMS = [
  'repo',
  'page',
  'specialty',
  'profile',
  'subdomain',
  'searchText',
  'sponsor',
  'groups'
];
class AdvocateUsersStore extends GenericStore {
  @observable users = [];
  @observable advocateUsers = [];
  @observable advocateLanguages = {
    advocateLanguages: [],
    advocateLanguageIdArray: []
  };
  @observable advocateSpecialties = {
    advocateSpecialties: [],
    advocateSpecialtyIdArray: []
  };
  @observable advocateLicenses = {
    advocateLicenses: [],
    advocateLicenseIdArray: []
  };
  @observable advocateLicenseDetails = {};
  // hack as both the advocate tab and advocate details forms are both submitted when saving advocate license details
  // for a license that is not currently associated with the advocate - prevents multiple save calls
  @observable savedNewAdvocateLicenseDetails = false;
  @observable advocateGroups = {
    advocateGroups: [],
    advocateGroupIdArray: []
  };
  @observable currentAdvocate = false;
  @observable currentAdvocateId = false;
  @observable itemCreated = false;
  @observable addEditUserTab = 'userInfo';
  @observable currentFormal = false;
  @observable advocateLicenseDetailsLoading = false;
  @observable advocateLicenseDetailsReady = false;
  @observable advocateTabLoading = false;
  @observable advocateTabReady = false;
  @observable showDeleteConfirmation = false;
  @observable query = { repo: 'prod' };
  @observable page = 0;
  @observable lastPage = 1;
  @observable specialties = [];
  @observable globalSpecialties = [];
  @observable globalLicenses = [];
  @observable globalLanguages = [];
  @observable userTypes = [];
  @observable timezones = [];
  @observable globalGroups = [];
  @observable ready = false;
  @observable showSaveSuccess = false;
  @observable showSaveError = false;
  profiles = [];
  editAction = null;
  sortField = 'USER';
  sortDirection = 'ascending';

  constructor(
    restStore,
    authStore,
    sponsorStore,
    advocatesMembersStore,
    companyUserStore,
    companyUsersStore
  ) {
    super();
    makeObservable(this);
    this.restStore = restStore;
    this.authStore = authStore;
    this.sponsorStore = sponsorStore;
    this.advocatesMembersStore = advocatesMembersStore;
    this.companyUserStore = companyUserStore;
    this.companyUsersStore = companyUsersStore;
  }

  resetAddEditUserToInitialState() {
    this.itemCreated = false;
    this.clearError();
    this.currentAdvocate = false;
    this.showSaveSuccess = false;
    this.showSaveError = false;
    this.currentAdvocateId = false;
    this.addEditUserTab = 'userInfo';
    this.currentFormal = false;
    this.advocateTabLoading = false;
    this.advocateTabReady = false;
    this.advocateGroups = {
      advocateGroups: [],
      advocateGroupIdArray: []
    };
  }

  load() {
    this.loading = true;

    return this.restStore
      .fetch('/api/advocacyproxy-sf/v1/advocaterequests/assignee', {
        method: 'GET',
        query: {
          subDomain: getSubdomain()
        },
        headers: {
          'account-id': this.authStore.accountId,
          'sponsor-id': getSponsorHeader(this.sponsorStore)
        }
      })
      .then(data => {
        this.loading = false;
        this.users = data;
      })
      .catch(err => {
        this.handleError(err);
      });
  }

  getInitialData = query => {
    this.loading = true;
    this.ready = false;
    Promise.all([
      this.search(query, query.page),
      this.getProfiles(),
      this.getGlobalGroups()
    ]).then(values => {
      this.loading = false;
      this.ready = true;
    });
  };

  getSpecialtiesData = advocateId => {
    this.advocateTabLoading = true;
    this.advocateTabReady = false;
    Promise.all([
      this.getAdvocateSpecialties(advocateId),
      this.getGlobalSpecialties()
    ]).then(() => {
      this.advocateTabLoading = false;
      this.advocateTabReady = true;
      return { status: 'Retrieved specialties' };
    });
  };

  getLicensesData = advocateId => {
    this.advocateTabLoading = true;
    this.advocateTabReady = false;
    Promise.all([
      this.getAdvocateLicenses(advocateId),
      this.getGlobalLicenses()
    ]).then(() => {
      this.advocateTabLoading = false;
      this.advocateTabReady = true;
      return { status: 'Retrieved licenses' };
    });
  };

  getLanguagesData = advocateId => {
    this.advocateTabLoading = true;
    this.advocateTabReady = false;
    Promise.all([
      this.getAdvocateLanguages(advocateId),
      this.getGlobalLanguages()
    ]).then(() => {
      this.advocateTabLoading = false;
      this.advocateTabReady = true;
      return { status: 'Retrieved languages' };
    });
  };

  fetchValidRoles = async () => {
    const fetchedRoles =
      (await this.restStore.fetch('/api/site/roles', {
        method: 'GET'
      })) || [];
    const reducedRoles = fetchedRoles.reduce(
      (all, { roles }) => all.concat(roles),
      []
    );
    return reducedRoles;
  };

  saveAdvocateData = async (view, action = null) => {
    if (this.savedNewAdvocateLicenseDetails) {
      this.advocateTabLoading = false;
      this.advocateTabReady = true;
      return;
    }
    let advocateGroups = null;
    let validRoles;
    switch (view) {
      case 'specialties':
        return this.saveAdvocateSpecialties(
          this.currentFormal.values.advocateSpecialtyIdArray
        );
      case 'languages':
        return this.saveAdvocateLanguages(
          this.currentFormal.values.advocateLanguageIdArray
        );
      case 'licenses':
        return this.saveAdvocateLicenses(
          this.currentFormal.values.advocateLicenseIdArray
        );
      case 'userInfo':
        validRoles = await this.fetchValidRoles();
        return this.currentFormal.values.hasOwnProperty('avatar')
          ? this.saveAdvocateDetailsWithAvatar(
              this.currentFormal.values,
              action,
              validRoles
            )
          : this.saveAdvocateDetails(
              this.currentFormal.values,
              action,
              true,
              validRoles
            );
      case 'permissions':
        validRoles = await this.fetchValidRoles();
        return this.saveAdvocateDetails(
          this.currentFormal.values,
          'PUT',
          true,
          validRoles
        );
      case 'groups':
        // if we are saving groups, and there is no currentAdvocateId, we are creating a new advocate
        // and need to save both the new advocate and their groups
        advocateGroups = this.currentFormal.values.advocateGroupIdArray;
        validRoles = await this.fetchValidRoles();
        !this.currentAdvocateId
          ? await this.saveAdvocateDetails(
              this.currentAdvocate,
              'POST',
              true,
              validRoles
            ).then(() => {
              if (this.currentAdvocateId) {
                if (this.currentAdvocate.hasOwnProperty('avatar')) {
                  this.saveAdvocateGroups(advocateGroups, false);
                  this.saveAdvocateDetailsWithAvatar(
                    this.currentAdvocate,
                    'PUT',
                    validRoles
                  ).then(() => {
                    this.advocateTabLoading = false;
                    this.advocateTabReady = true;
                  });
                } else this.saveAdvocateGroups(advocateGroups, true);
              }
            })
          : this.saveAdvocateGroups(advocateGroups, true);
        break;
      default:
        break;
    }
  };

  getGlobalSpecialties = () => {
    const { repo } = this.query;
    return this.restStore
      .fetch(
        `/api/advocacyproxy-sf/v1/specialties?repo=${repo}&subDomain=${getSubdomain()}`,
        {
          method: 'GET',
          headers: {
            'account-id': this.authStore.accountId,
            'sponsor-id': getSponsorHeader(this.sponsorStore)
          }
        }
      )
      .then(specialties => {
        specialties = specialties.map(specialty => ({
          text: specialty.name,
          value: specialty.id,
          title: specialty.name,
          ...specialty
        }));
        this.globalSpecialties = specialties;
        return specialties;
      })
      .catch(err => {
        this.globalSpecialties = [];
        this.handleError(err);
      });
  };

  getGlobalLicenses = () => {
    const { repo } = this.query;
    return this.restStore
      .fetch(
        `/api/advocacyproxy-sf/v1/licensures?repo=${repo}&subDomain=${getSubdomain()}`,
        {
          method: 'GET',
          headers: {
            'account-id': this.authStore.accountId,
            'sponsor-id': getSponsorHeader(this.sponsorStore)
          }
        }
      )
      .then(licenses => {
        licenses = licenses.map(license => ({
          text: license.name,
          value: license.stateLicensureId,
          title: license.name,
          ...license
        }));
        this.globalLicenses = licenses;
        return licenses;
      })
      .catch(err => {
        this.globalLicenses = [];
        this.handleError(err);
      });
  };

  getGlobalLanguages = () => {
    const { repo } = this.query;
    return this.restStore
      .fetch(`/api/advocacyproxy-sf/v1/languages?repo=${repo}`, {
        method: 'GET',
        headers: {
          'account-id': this.authStore.accountId,
          'sponsor-id': getSponsorHeader(this.sponsorStore)
        }
      })
      .then(languages => {
        languages = languages.map(language => ({
          text: language.name,
          value: language.id,
          title: language.name,
          ...language
        }));
        this.globalLanguages = languages;
        return languages;
      })
      .catch(err => {
        this.globalLanguages= [];
        this.handleError(err);
      });
  };

  getUserTypes = () => {
    const { repo } = this.query;
    return this.restStore
      .fetch(`/api/advocacyproxy-sf/v1/advocates/usertypes?repo=${repo}`, {
        method: 'GET',
        headers: {
          'account-id': this.authStore.accountId,
          'sponsor-id': getSponsorHeader(this.sponsorStore)
        }
      })
      .then(userTypes => {
        this.userTypes = 
          userTypes.map(userType => ({
            text: userType.userTypeDescription,
            value: userType.userTypeId,
            title: userType.userTypeDescription,
            ...userType
          }))
        return userTypes;
      })
      .catch(err => {
        this.userTypes = [];
        this.handleError(err);
      });
  };

  getTimezones = () => {
    const { repo } = this.query;
    return this.restStore
      .fetch(`/api/advocacyproxy-sf/v1/timezones?repo=${repo}`, {
        method: 'GET',
        headers: {
          'account-id': this.authStore.accountId,
          'sponsor-id': getSponsorHeader(this.sponsorStore)
        }
      })
      .then(timezones => {
        timezones = timezones.map(timezone => ({
          text: timezone.name,
          value: timezone.name,
          title: timezone.name,
          ...timezone
        }));
        this.timezones = timezones;
        return timezones;
      })
      .catch(err => {
        this.timezones = [];
        this.handleError(err);
      });
  };

  saveAdvocateSpecialties = specialties => {
    this.advocateTabLoading = true;
    this.advocateTabReady = false;
    const { repo } = this.query;
    const body = specialties.map(specialtyId => ({
      advocateId: this.currentAdvocate.advocateId,
      specialtyId
    }));
    return this.restStore
      .fetch(
        `/api/advocacyproxy-sf/v1/advocates/specialties?repo=${repo}&subDomain=${getSubdomain()}`,
        {
          method: 'POST',
          body: JSON.stringify(
            body.length
              ? body
              : [{ advocateId: this.currentAdvocate.advocateId }]
          ),
          headers: {
            'account-id': this.authStore.accountId,
            'sponsor-id': getSponsorHeader(this.sponsorStore)
          }
        }
      )
      .then(newAdvocateSpecialties => {
        this.advocateSpecialties = {
          advocateSpecialties: newAdvocateSpecialties,
          advocateSpecialtyIdArray: newAdvocateSpecialties.map(
            specialty => specialty.specialtyId
          )
        };
        this.advocateTabLoading = false;
        this.advocateTabReady = true;
      })
      .catch(err => {
        this.advocateTabLoading = false;
        this.advocateTabReady = true;
        this.handleError(err);
      });
  };

  saveAdvocateLanguages = languages => {
    this.advocateTabLoading = true;
    this.advocateTabReady = false;
    const { repo } = this.query;
    const body = languages.map(languageId => ({
      advocateId: this.currentAdvocate.advocateId,
      languageId
    }));
    return this.restStore
      .fetch(`/api/advocacyproxy-sf/v1/advocates/languages?repo=${repo}`, {
        method: 'POST',
        body: JSON.stringify(
          body.length ? body : [{ advocateId: this.currentAdvocate.advocateId }]
        ),
        headers: {
          'account-id': this.authStore.accountId,
          'sponsor-id': getSponsorHeader(this.sponsorStore)
        }
      })
      .then(newAdvocateLanguages => {
        this.advocateLanguages = {
          advocateLanguages: newAdvocateLanguages,
          advocateLanguageIdArray: newAdvocateLanguages.map(
            language => language.languageId
          )
        };
        this.advocateTabLoading = false;
        this.advocateTabReady = true;
      })
      .catch(err => {
        this.advocateTabLoading = false;
        this.advocateTabReady = true;
        this.handleError(err);
      });
  };

  saveAdvocateLicenses = (licenses, manageLoading = true) => {
    if (manageLoading) {
      this.advocateTabLoading = true;
      this.advocateTabReady = false;
    }
    const { repo } = this.query;
    const body = licenses.map(licenseId => {
      return {
        advocateId: this.currentAdvocate.advocateId,
        stateLicensureId: licenseId
      };
    });
    return this.restStore
      .fetch(`/api/advocacyproxy-sf/v1/advocates/licensures?repo=${repo}`, {
        method: 'POST',
        body: JSON.stringify(
          body.length ? body : [{ advocateId: this.currentAdvocate.advocateId }]
        ),
        headers: {
          'account-id': this.authStore.accountId,
          'sponsor-id': getSponsorHeader(this.sponsorStore)
        }
      })
      .then(newAdvocateLicenses => {
        this.advocateLicenses = {
          advocateLicenses: newAdvocateLicenses,
          advocateLicenseIdArray: newAdvocateLicenses.map(
            license => license.stateLicensureId
          )
        };
        if (manageLoading) {
          this.advocateTabLoading = false;
          this.advocateTabReady = true;
        }
      })
      .catch(err => {
        if (manageLoading) {
          this.advocateTabLoading = false;
          this.advocateTabReady = true;
        }
        this.handleError(err);
      });
  };

  saveAdvocateLicenseDetails = async licenseDetails => {
    this.advocateTabLoading = true;
    this.advocateTabReady = false;
    let action = 'POST';
    const { repo } = this.query;
    // In the event that a user has selected a license, but not yet saved it to their account, we need to
    // first save the license to the advocate, then we can save the details they entered
    if (!licenseDetails.advocateLicensureId) {
      this.savedNewAdvocateLicenseDetails = true;
      await this.saveAdvocateLicenses(
        [
          ...this.currentFormal.values.advocateLicenseIdArray,
          licenseDetails.stateLicensureId
        ],
        false
      );
      const advocateLicense = this.advocateLicenses.advocateLicenses.find(
        advocateLicense =>
          advocateLicense.stateLicensureId === licenseDetails.stateLicensureId
      );
      licenseDetails.advocateLicensureId = advocateLicense.advocateLicensureId;
    }
    let body = {
      ...licenseDetails,
      advocateId: this.currentAdvocateId,
      advocateLicensureId: licenseDetails.advocateLicensureId
    };
    if (licenseDetails.startDate) {
      body.startDate = moment(licenseDetails.startDate)
        .utc()
        .format('YYYY-MM-DD');
    }
    if (licenseDetails.endDate) {
      body.endDate = moment(licenseDetails.endDate).utc().format('YYYY-MM-DD');
    }
    return this.restStore
      .fetch(
        `/api/advocacyproxy-sf/v1/advocates/licensures/details?repo=${repo}`,
        {
          method: action,
          body: JSON.stringify(body),
          headers: {
            'account-id': this.authStore.accountId,
            'sponsor-id': getSponsorHeader(this.sponsorStore)
          }
        }
      )
      .then(newAdvocateLicenseDetails => {
        this.advocateLicenseDetails = newAdvocateLicenseDetails;
        this.advocateTabLoading = false;
        this.advocateTabReady = true;
        this.savedNewAdvocateLicenseDetails = false;
        this.showSaveSuccess = true;
        return newAdvocateLicenseDetails;
      })
      .catch(err => {
        this.advocateTabLoading = false;
        this.advocateTabReady = true;
        this.savedNewAdvocateLicenseDetails = false;
        this.showSaveSuccess = false;
        this.handleError(err);
      });
  };

  @action
  search = (query, page = 1) => {
    debug('search(%o,%s,%s)', query, page);
    USERS_TERMS.forEach(term => {
      if (query[term]) {
        if (query[term] !== get(this.query, term)) {
          set(this.query, term, query[term]);
        }
      } else if (has(this.query, term)) {
        remove(this.query, term);
      }
    });
    this.page = page;
    return this.fetchUsers();
  };

  fetchUsers() {
    this.loading = true;
    const { sponsor, ...advocateApiParams } = this.query;
    let apiQuery = {};
    Object.entries(advocateApiParams).forEach(([key, value]) => {
      if (value !== 'All') apiQuery[key] = value;
    });
    const apiParams = new URLSearchParams({
      ...apiQuery,
      page: this.page - 1,
      sortedOrder: this.sortDirection === 'ascending' ? 'asc' : 'desc',
      subDomain: getSubdomain()
    }).toString();
    return this.restStore
      .fetch(`/api/advocacyproxy-sf/v2/advocates?${apiParams}`, {
        method: 'GET',
        headers: {
          'sponsor-id':
            sponsor === 'All' || !sponsor
              ? getSponsorHeader(this.sponsorStore)
              : sponsor,
          'account-id': this.authStore.accountId
        }
      })
      .then(({ page, lastPage, results }) => {
        this.loading = false;
        this.advocateUsers = results.map(advocate => ({
          ...advocate,
          sponsorIds: convertSponsorObjectArrayToSponsorIdArray(
            advocate.sponsors
          ),
          presence: advocate.presence === 'AVAILABLE'
        }));
        this.page = page + 1;
        this.lastPage = Math.max(page, lastPage) + 1;
        return results;
      })
      .catch(err => {
        this.advocateUsers = [];
        this.handleError(err);
      });
  }

  @action
  sortBy(sortField, sortDirection) {
    this.sortField = sortField || this.sortField;
    this.sortDirection = sortDirection || this.sortDirection;
    this.loading = true;
    this.fetchUsers();
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

  async getProfiles() {
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

  getSpecialities = () => {
    const { repo } = this.query;
    return this.restStore
      .fetch(
        `/api/advocacyproxy-sf/v1/advocates/specialties/all?repo=${repo}`,
        {
          method: 'GET',
          headers: {
            'account-id': this.authStore.accountId,
            'sponsor-id': getSponsorHeader(this.sponsorStore)
          }
        }
      )
      .then(specialties => {
        specialties = specialties.map(specialty => {
          return { text: specialty.name, value: specialty.name };
        });
        this.specialties = specialties;
        return specialties;
      })
      .catch(err => {
        this.specialties = [];
        this.handleError(err);
      });
  };

  getAdvocateSpecialties = advocateId => {
    const { repo } = this.query;
    return this.restStore
      .fetch(
        `/api/advocacyproxy-sf/v1/advocates/specialties?id=${advocateId}&repo=${repo}`,
        {
          method: 'GET',
          headers: {
            'account-id': this.authStore.accountId,
            'sponsor-id': getSponsorHeader(this.sponsorStore)
          }
        }
      )
      .then(advocateSpecialties => {
        this.advocateSpecialties = {
          advocateSpecialties,
          advocateSpecialtyIdArray: advocateSpecialties.map(
            specialty => specialty.specialtyId
          )
        };
        return advocateSpecialties;
      })
      .catch(err => {
        this.handleError(err);
      });
  };

  getAdvocateLicenses = advocateId => {
    const { repo } = this.query;
    return this.restStore
      .fetch(
        `/api/advocacyproxy-sf/v1/advocates/licensures?id=${advocateId}&repo=${repo}`,
        {
          method: 'GET',
          headers: {
            'account-id': this.authStore.accountId,
            'sponsor-id': getSponsorHeader(this.sponsorStore)
          }
        }
      )
      .then(advocateLicenses => {
        this.advocateLicenses = {
          advocateLicenses,
          advocateLicenseIdArray: advocateLicenses.map(
            license => license.stateLicensureId
          )
        };
        return advocateLicenses;
      })
      .catch(err => {
        this.handleError(err);
      });
  };

  getAdvocateLicenseDetails = advocateLicenseId => {
    const { repo } = this.query;
    this.advocateLicenseDetailsLoading = true;
    this.advocateLicenseDetailsReady = false;
    return this.restStore
      .fetch(
        `/api/advocacyproxy-sf/v1/advocates/licensures/details?id=${advocateLicenseId}&repo=${repo}`,
        {
          method: 'GET',
          headers: {
            'account-id': this.authStore.accountId,
            'sponsor-id': getSponsorHeader(this.sponsorStore)
          }
        }
      )
      .then(advocateLicenseDetails => {
        this.advocateLicenseDetails = advocateLicenseDetails;
        this.advocateLicenseDetailsLoading = false;
        this.advocateLicenseDetailsReady = true;
        return advocateLicenseDetails;
      })
      .catch(err => {
        this.advocateLicenseDetailsLoading = false;
        this.advocateLicenseDetailsReady = true;
        this.advocateLicenseDetails = {};
        this.handleError(err);
      });
  };

  getAdvocateLanguages = advocateId => {
    const { repo } = this.query;
    return this.restStore
      .fetch(
        `/api/advocacyproxy-sf/v1/advocates/languages?id=${advocateId}&repo=${repo}`,
        {
          method: 'GET',
          headers: {
            'account-id': this.authStore.accountId,
            'sponsor-id': getSponsorHeader(this.sponsorStore)
          }
        }
      )
      .then(advocateLanguages => {
        this.advocateLanguages = {
          advocateLanguages,
          advocateLanguageIdArray: advocateLanguages.map(
            language => language.languageId
          )
        };
        return advocateLanguages;
      })
      .catch(err => {
        this.handleError(err);
      });
  };

  getAdvocateData = advocateId => {
    this.advocateTabLoading = true;
    this.advocateTabReady = false;
    Promise.all([
      advocateId && this.getAdvocateDetails(advocateId),
      advocateId && this.getAdvocateGroups(advocateId),
      this.getTimezones(),
      this.getUserTypes()
    ]).then(() => {
      if (
        this.currentAdvocateId &&
        !this.advocateGroups?.advocateGroupIdArray?.length
      ) {
        this.addEditUserTab = 'groups';
      } else {
        this.advocateTabLoading = false;
        this.advocateTabReady = true;
      }
      return { status: 'Retrieved advocate form data' };
    });
  };

  getAdvocateDetails = advocateId => {
    const { repo } = this.query;
    return this.restStore
      .fetch(
        `/api/advocacyproxy-sf/v1/advocates/details?id=${advocateId}&repo=${repo}&subDomain=${getSubdomain()}`,
        {
          method: 'GET',
          headers: {
            'account-id': this.authStore.accountId,
            'sponsor-id': getSponsorHeader(this.sponsorStore)
          }
        }
      )
      .then(advocate => {
        this.currentAdvocate = {
          ...this.currentAdvocate,
          ...advocate,
          presence: advocate.presence === 'AVAILABLE'
        };
      })
      .catch(err => {
        this.handleError(err);
      });
  };

  userLoginTaken = userLogin => {
    const { repo } = this.query;
    return this.restStore
      .fetch(
        `/api/advocacyproxy-sf/v1/advocates/usernamecheck?userName=${userLogin}&repo=${repo}`,
        {
          method: 'GET',
          headers: {
            'account-id': this.authStore.accountId,
            'sponsor-id': getSponsorHeader(this.sponsorStore)
          }
        }
      )
      .then(userNameCheck => userNameCheck.success)
      .catch(err => {
        this.handleError(err);
      });
  };

  // @see https://gist.github.com/wuchengwei/b7e1820d39445f431aeaa9c786753d8e
  dataURLtoBlob = dataurl => {
    const arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      u8arr = new Uint8Array(bstr.length);
    let n = bstr.length;
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  saveAdvocateDetailsWithAvatar = (advocate, action, validRoles) => {
    this.advocateTabLoading = true;
    this.advocateTabReady = false;
    this.restStore
      .upload(
        `/api/avatar/user/${advocate.ssoId}?site=${getSubdomain()}`,
        this.dataURLtoBlob(advocate.avatar)
      )
      .then(() => {
        this.restStore
          .fetch(
            `/api/members/account?id=${
              advocate.ssoId
            }&fetchAdvocateDetails=${true}&
         accountId=${this.authStore.accountId}`
          )
          .then(member => {
            const { url } = member?.avatar;
            this.saveAdvocateDetails(
              { ...advocate, avatarUrl: url },
              action,
              true,
              validRoles
            ).then(() => {
              this.advocateTabLoading = false;
              this.advocateTabReady = true;
            });
          })
          .catch(err => {
            this.advocateTabLoading = false;
            this.advocateTabReady = true;
            this.handleError(err);
          });
      })
      .catch(err => {
        this.advocateTabLoading = false;
        this.advocateTabReady = true;
        this.handleError(err);
      });
  };

  saveAdvocateDetails = (advocate, action, manageLoading, validRoles) => {
    if (manageLoading) {
      this.advocateTabLoading = true;
      this.advocateTabReady = false;
    }
    const { repo } = this.query;
    const { avatar, ...advocateToSave } = advocate;
    const permissionsFromRoles = getPermissionsFromRoles(
      this.profiles.find(({ profileName }) => profileName === advocate.profile)
        .roles,
      validRoles
    );
    const body = {
      ...advocateToSave,
      permissions: permissionsFromRoles,
      externalId: isExternalUser(advocateToSave.userType, this)
        ? advocateToSave.externalId
        : null
      // presence: advocate.presence ? 'AVAILABLE' : 'OFFLINE'
    };

    return (
      this.restStore
        // there is no v2 for PUT
        .fetch(
          `/api/advocacyproxy-sf/${
            advocateToSave.advocateId ? 'v1' : 'v2'
          }/advocates/details?repo=${repo}&subDomain=${getSubdomain()}`,
          {
            method: action,
            body: JSON.stringify(body),
            headers: {
              'account-id': this.authStore.accountId,
              'sponsor-id': getSponsorHeader(this.sponsorStore)
            }
          }
        )
        .then(advocate => {
          this.clearError();
          this.showSaveSuccess = true;
          this.showSaveError = false;
          this.currentAdvocateId = advocate.advocateId;
          this.currentAdvocate = {
            ...this.currentAdvocate,
            ...advocate,
            presence: advocate.presence === 'AVAILABLE'
          };
          if (manageLoading) {
            this.advocateTabReady = true;
            this.advocateTabLoading = false;
          }
        })
        .catch(err => {
          this.handleError(err);
          this.showSaveSuccess = false;
          this.showSaveError = true;
          if (
            err.body?.error?.message
              ?.toLowerCase()
              .includes('advocate already exists')
          ) {
            this.error = t(
              'Advocate User Name (Login) is already taken, please provide a unique User Name.'
            );
          } else {
            this.error = t(
              'An error occurred.  Contact your system administrator for additional support.'
            );
          }
          this.currentAdvocate = advocate;
          if (manageLoading) {
            this.advocateTabReady = true;
            this.advocateTabLoading = false;
          }
        })
    );
  };

  deleteAdvocate = (advocateId, userLogin, email) => {
    const { repo } = this.query;
    this.loading = true;
    return this.restStore
      .fetch(
        `/api/advocacyproxy-sf/v1/advocates?repo=${repo}&subDomain=${getSubdomain()}`,
        {
          method: 'DELETE',
          body: JSON.stringify([{ advocateId, userLogin }]),
          headers: {
            'account-id': this.authStore.accountId,
            'sponsor-id': getSponsorHeader(this.sponsorStore)
          }
        }
      )
      .then(deleteResponse => {
        if (deleteResponse?.error) {
          this.error = deleteResponse.error;
          this.showSaveError = true;
        } else {
          this.showDeleteConfirmation = `${userLogin} (${email})`;
        }
        this.loading = false;
        return deleteResponse;
      })
      .catch(err => {
        this.loading = false;
        this.handleError(err);
      });
  };

  getGroupsData = advocateId => {
    this.advocateTabLoading = true;
    this.advocateTabReady = false;
    Promise.all([
      advocateId && this.getAdvocateGroups(advocateId),
      this.getGlobalGroups()
    ]).then(() => {
      this.advocateTabLoading = false;
      this.advocateTabReady = true;
    });
  };

  getAdvocateGroups = advocateId => {
    const { repo } = this.query;
    return this.restStore
      .fetch(
        `/api/advocacyproxy-sf/v1/advocates/groups?id=${advocateId}&repo=${repo}`,
        {
          method: 'GET',
          headers: {
            'account-id': this.authStore.accountId,
            'sponsor-id': getSponsorHeader(this.sponsorStore)
          }
        }
      )
      .then(advocateGroups => {
        this.advocateGroups = {
          advocateGroups: advocateGroups.groups,
          advocateGroupIdArray: advocateGroups.groups.map(
            ({ groupId }) => groupId
          )
        };
      })
      .catch(err => {
        this.advocateGroups = {};
        this.handleError(err);
      });
  };

  getGlobalGroups = (sponsorOverride = null) => {
    let { repo, sponsor } = this.query;
    if (sponsorOverride === 'All') {
      sponsorOverride = getSponsorHeader(this.sponsorStore);
    }
    sponsor = sponsor === 'All' ? null : sponsor;
    return this.restStore
      .fetch(
        `/api/advocacyproxy-sf/v1/groups?repo=${repo}&subDomain=${getSubdomain()}`,
        {
          method: 'GET',
          headers: {
            'account-id': this.authStore.accountId,
            'sponsor-id':
              sponsorOverride || sponsor || getSponsorHeader(this.sponsorStore)
          }
        }
      )
      .then(groups => {
        this.globalGroups= groups;
        return groups;
      })
      .catch(err => {
        this.globalGroups = [];
        this.handleError(err);
      });
  };

  saveAdvocateGroups = (groups, manageLoading) => {
    if (manageLoading) {
      this.advocateTabLoading = true;
      this.advocateTabReady = false;
    }
    const { repo } = this.query;
    let groupsData = [];
    groups.forEach(id => {
      let group = this.globalGroups.filter(({ groupId }) => id === groupId)[0];
      if (typeof group === 'object') {
        groupsData = [...groupsData, { ...group, externalId: undefined }];
      }
    });
    const body = {
      advocateId: this.currentAdvocate.advocateId,
      groups: groupsData
    };
    return this.restStore
      .fetch(
        `/api/advocacyproxy-sf/v1/advocates/groups?repo=${repo}&subDomain=${getSubdomain()}`,
        {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            'account-id': this.authStore.accountId,
            'sponsor-id': getSponsorHeader(this.sponsorStore)
          }
        }
      )
      .then(newAdvocateGroups => {
        this.advocateGroups = {
          advocateGroups: newAdvocateGroups.groups,
          advocateGroupIdArray: newAdvocateGroups.groups.map(
            ({ groupId }) => groupId
          )
        };
        if (manageLoading) {
          this.advocateTabLoading = false;
          this.advocateTabReady = true;
        }
      })
      .catch(err => {
        this.advocateGroups = {};
        if (manageLoading) {
          this.advocateTabLoading = false;
          this.advocateTabReady = true;
        }
        this.handleError(err);
      });
  };

  getAdvocateByEmail(email) {
    this.loading = true;
    this.ready = false;
    const apiParams = new URLSearchParams({
      searchText: email,
      page: 0,
      subDomain: getSubdomain()
    }).toString();
    return this.restStore
      .fetch(`/api/advocacyproxy-sf/v2/advocates?${apiParams}`, {
        method: 'GET',
        headers: {
          'sponsor-id': getSponsorHeader(this.sponsorStore),
          'account-id': this.authStore.accountId
        }
      })
      .then(({ results }) => {
        this.currentAdvocate = results[0];
        this.loading = false;
        this.ready = true;
        return results[0];
      })
      .catch(err => {
        this.currentAdvocate = false;
        this.loading = false;
        this.ready = true;
        this.handleError(err);
      });
  }
}
export default AdvocateUsersStore;
