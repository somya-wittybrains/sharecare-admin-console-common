import { makeObservable, observable, action } from 'mobx';
import { getSubdomain, getSponsorHeader, formQueryString } from 'utils';
import GenericStore from 'model/GenericStore';
import { DEFAULT_ENTITY as DEFAULT_ACCOUNT } from './member';
import { getMultiSiteSponsors } from '../utils';

const debug = require('debug')('model.MemberStore');

export default class MemberStore extends GenericStore {
  @observable accountReference = {};
  @observable reference = {};
  @observable loadingCarePlanAndAdvocacy = false;
  @observable loadingAllAdvocateRequests = false;
  @observable advocateRequestsLoading = false;
  @observable member = observable.object(DEFAULT_ACCOUNT());
  @observable carePlan = {};
  @observable carePlanOffering = {};
  @observable memberClinicalAdvocacyRequest = null;
  @observable memberHealthAdvocacyRequest = null;
  @observable advocateRequests = {};
  memberAssignmentModelHousehold = 'household';
  advocateAssignmentModelFamily = 'Family Advocacy';
  advocateAssignmentModelGroup = 'Group Advocacy';

  constructor(restStore, authStore, sponsorStore, memberAccountStore) {
    debug('constructor()');

    super();
    makeObservable(this);  
    this.restStore = restStore;
    this.authStore = authStore;
    this.sponsorStore = sponsorStore;
    this.memberAccountStore = memberAccountStore;
  }

  carePlanSSOId = '';

  getCarePlanAndAdvocacyInfo = ssoId => {
    if (this.carePlanSSOId === ssoId) return;
    this.carePlanSSOId = ssoId;
    this.loadingCarePlanAndAdvocacy = true;
    Promise.all([
      // TODO JC: We will add the call getAdvocateRequestForMember once with no specialty and get all member
      // advocate requests once API is ready is november.  There needs to be a larger refactor for calls made to
      // advocacy api
      this.authStore.isAdvocateUser &&
        this.getAdvocateRequestForMember(ssoId, {
          specialty: this.sponsorStore.clinicalAdvocacyName
        }),
      this.authStore.isAdvocateUser &&
        this.getAdvocateRequestForMember(ssoId, {
          specialty: this.sponsorStore.healthAdvocacyName,
          advocateAssignmentModel: this.advocateAssignmentModelFamily
        }),
      this.authStore.isAdvocateUser &&
        this.getAdvocateRequestForMember(ssoId, {
          specialty: this.sponsorStore.healthAdvocacyName,
          advocateAssignmentModel: this.advocateAssignmentModelGroup
        }),
      this.checkCarePlanEnrolment(ssoId),
      this.checkCarePlanOffering(ssoId)
    ])
      .then(
        ([
          clinicalAdvocacyRequest,
          healthAdvocacyRequest,
          groupAdvocacyRequest,
          ...carPlanRequests
        ]) => {
          if (healthAdvocacyRequest?.id) {
            this.memberHealthAdvocacyRequest = healthAdvocacyRequest;
          } else if (groupAdvocacyRequest?.id) {
            // as group advocate requests function almost identically to family advocate requests, we will allow the
            // ui to handle both the same to avoid special cases everywhere
            this.memberHealthAdvocacyRequest = {
              ...groupAdvocacyRequest,
              isGroupAdvocateRequest: true,
              advocateId: groupAdvocacyRequest.groupId
            };
          } else {
            this.memberHealthAdvocacyRequest = null;
          }
          this.loadingCarePlanAndAdvocacy = false;
        }
      )
      .catch(error => {
        return { error };
      });
  };

  @action
  loadAccount(id) {
    debug('loadAccount(%s)', id);
    const fetchAdvocateDetails = this.authStore.isAdvocateUser;
    const accountId = this.authStore.accountId;
    let sponsorVal = getMultiSiteSponsors(
      this.sponsorStore.sponsor && this.sponsorStore.sponsor.id,
      this.authStore.sponsors
    );
    if (
      sponsorVal === this.accountReference.sponsor &&
      this.accountReference.id === id
    ) {
      return Promise.resolve(this.member);
    }

    this.loading = true;
    this.accountReference = { id, sponsor: sponsorVal };

    return this.restStore
      .fetch(
        `/api/members/account?id=${id}&fetchAdvocateDetails=${fetchAdvocateDetails}&accountId=${accountId}&sponsor=${sponsorVal}&showSSN=${
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
          this.member = member;
          this.new = false;
          this.loading = false;
          this.error = '';
          this.message = '';

          return this.member;
        })
      )
      .catch(
        action(err => {
          debug(err);
          this.accountReference = {};
          this.error = err.message;
          this.message = '';
          this.loading = false;
        })
      );
  }

  @action
  reset() {
    this.accountReference = {};
    this.reference = {};
    this.member = observable.object(DEFAULT_ACCOUNT());
  }
  @action
  loadMember(referenceId) {
    debug('loadMember(%s)', referenceId);
    let sponsorVal = getMultiSiteSponsors(
      this.sponsorStore.sponsor && this.sponsorStore.sponsor.id,
      this.authStore.sponsors
    );
    if (
      this.accountReference.referenceId === referenceId &&
      this.accountReference.sponsor === sponsorVal
    ) {
      return Promise.resolve(this.member);
    }
    this.loading = true;
    this.accountReference = {
      sponsor: sponsorVal,
      referenceId,
      showSSN: this.authStore.hasRole(
        'member-management',
        'CONSOLE_MEMBER_DEMOGRAPHICS_VIEW_SSN'
      )
        ? 'Y'
        : 'N'
    };

    return this.restStore
      .fetch(
        `/api/members/member?${Object.entries(this.accountReference)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')}`
      )
      .then(
        action(member => {
          this.member = member;
          this.new = false;
          this.loading = false;
          this.error = '';
          this.message = '';

          return this.member;
        })
      )
      .catch(
        action(err => {
          debug(err);
          this.error = err.message;
          this.message = '';
          this.loading = false;
        })
      );
  }

  @action
  sendPasswordReset() {
    debug('sendPasswordReset()');

    return this.restStore
      .fetch('/api/members/account/sendReset', {
        method: 'POST',
        body: JSON.stringify(this.member)
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

  @action
  async checkCarePlanEnrolment(ssoId) {
    debug('checkCarePlanEnrolment(%s)', ssoId);
    this.reference = { ssoId };
    const sponsorId = this.sponsorStore.sponsor.id;

    await this.restStore
      .fetch(
        `/api/advocacycareplans/advocate/v1/careplan/?ssoid=${ssoId}&sponsorId=${sponsorId}`
      )
      .then(
        action(response => {
          this.carePlan = response;
          this.new = false;
          this.error = '';
          this.message = '';

          return this.response;
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

  @action
  async checkCarePlanOffering(ssoId) {
    debug('checkCarePlanEligiblity(%s)', ssoId);
    this.reference = { ssoId };
    const sponsorId = this.sponsorStore.sponsor.id;

    // This call also tells us if a member is eligible for Clinical Advocacy
    await this.restStore
      .fetch(
        `/api/advocacycareplans/advocate/v1/careplan/offering?ssoId=${ssoId}&sponsorId=${sponsorId}`
      )
      .then(
        action(response => {
          this.carePlanOffering = response;
          this.new = false;
          this.error = '';
          this.message = '';

          return response;
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

  @action
  getAdvocateRequestForMember = async (ssoId, options) => {
    const apiQuery = formQueryString({
      ...options,
      subDomain: getSubdomain(),
      memberSSOIds: ssoId
    });
    this.reference = { ssoId };
    const sponsorId = this.sponsorStore.sponsor.id;
    let advocateRequest = null;
    await this.restStore
      // TODO JC: get all member requests without specialty when api is ready
      .fetch(
        `/api/advocacyproxy-sf/v2/advocaterequests/search?${apiQuery}`,
        // `/api/advocacyproxy-sf/v2/advocaterequests/search?subDomain=${getSubdomain()}&specialty=${specialty}&memberSSOId=${'xxx'}`,
        // `/api/advocacyproxy-sf/v2/advocaterequests/search?subDomain=${getSubdomain()}&memberSSOId=${ssoId}`,
        {
          method: 'GET',
          headers: {
            'sponsor-id': !sponsorId
              ? getSponsorHeader(this.sponsorStore)
              : sponsorId,
            'account-id': this.authStore.accountId
          }
        }
      )
      .then(
        action(({ page, lastPage, results }) => {
          advocateRequest = results[0] || null;
          options.specialty === this.sponsorStore.clinicalAdvocacyName
            ? (this.memberClinicalAdvocacyRequest = advocateRequest)
            : (this.memberHealthAdvocacyRequest = advocateRequest);
          return results;
        })
      )
      .catch(err => {
        debug(err);
        // this.error = err.message;
        options.specialty === this.sponsorStore.clinicalAdvocacyName
          ? (this.memberClinicalAdvocacyRequest = null)
          : (this.memberHealthAdvocacyRequest = null);
        advocateRequest = { error: err };
      });
    return advocateRequest;
  };

  @action
  createMemberAdvocateRequest = (ssoId, specialty, requestorType) => {
    this.reference = { ssoId };
    if (!this.member.eligibilitySponsor) {
      debug('Member must have a sponsor to make this request');
      return;
    }
    this.restStore
      .fetch(
        '/api/advocacyproxy-sf/v1/advocaterequests/memberAssignmentRequest',
        {
          method: 'POST',
          body: JSON.stringify({
            memberSSOId: ssoId,
            specialty,
            requestorType
          }),
          headers: {
            'sponsor-id': this.member.eligibilitySponsor,
            'account-id': this.authStore.accountId
          }
        }
      )
      .then(
        action(response => {
          // set request to assigned to display unassigned icon
          this.memberClinicalAdvocacyRequest.requestStatus = 'Unassigned';
          this.memberClinicalAdvocacyRequest.id = response.requestId;
        })
      )
      .catch(err => {
        debug(err);
      });
  };

  @action
  getAllAdvocateRequests = () => {
    this.loadingAllAdvocateRequests = true;
    this.getAdvocateRequests(
      { assigneeId: this.authStore.advocateDetails.advocateId },
      false,
      true
    ).then(({ totalRecords, totalMembers }) => {
      this.advocateRequests.totalRecords = totalRecords;
      this.advocateRequests.totalMembers = totalMembers;
      this.loadingAllAdvocateRequests = false;
    });
  };

  @action
  async getAdvocateRequests(
    query,
    manageState = true,
    excludeSpecialty = false
  ) {
    const isGroupAdvocacyQuery =
      query.advocateAssignmentModel === this.advocateAssignmentModelGroup;
    !query.specialty &&
      !excludeSpecialty &&
      (query.specialty = this.sponsorStore.healthAdvocacyName);
    const advocateRequestTypeKey = isGroupAdvocacyQuery
      ? this.advocateAssignmentModelGroup
      : query.specialty;
    if (manageState) {
      this.advocateRequests[advocateRequestTypeKey] = {};
      this.advocateRequestsLoading = true;
    }
    let advocateRequestsResults = null;
    isGroupAdvocacyQuery
      ? (query.memberAssignmentModel = this.memberAssignmentModelHousehold)
      : (query.assigneeId = this.authStore.advocateDetails?.advocateId);
    const apiParams = formQueryString({
      subDomain: getSubdomain(),
      ...query
    });
    await this.restStore
      .fetch(`/api/advocacyproxy-sf/v2/advocaterequests/search?${apiParams}`, {
        method: 'GET',
        headers: {
          'sponsor-id': getSponsorHeader(this.sponsorStore),
          'account-id': this.authStore.accountId
        }
      })
      .then(
        action(({ page, lastPage, totalRecords, results, totalMembers }) => {
          advocateRequestsResults = {
            page,
            lastPage,
            totalRecords,
            requests: results,
            totalMembers
          };
          if (manageState) {
            this.advocateRequests[advocateRequestTypeKey] =
              advocateRequestsResults;
            this.advocateRequestsLoading = false;
          }
        })
      )
      .catch(err => {
        debug(err);
        // this.error = err.message;
        advocateRequestsResults = {};
        if (manageState) {
          this.advocateRequests[advocateRequestTypeKey] = {};
          this.advocateRequestsLoading = false;
        }
      });
    return advocateRequestsResults;
  }
}
