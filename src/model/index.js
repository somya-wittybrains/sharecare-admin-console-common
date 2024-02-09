import { createContext } from 'react';
import { observable } from 'mobx';
import ConfigStore from './ConfigStore';
import RESTStore from './RESTStore';
import AuthStore from './AuthStore';
import SponsorStore from './SponsorStore';
import NotificationStore from './NotificationStore';
import VersionStore from './VersionStore';
import CloudinaryStore from './CloudinaryStore';
import LocalesStore from './LocalesStore';
import MembersStore from './MembersStore';
import MemberStore from './MemberStore';
import SponsorshipsStore from './SponsorshipsStore';
import MemberAccountStore from './MemberAccountStore';
import casesTasksStoreSingleton from './CasesTasksStore';
import ProductVariantsStore from 'common-modules/benefits-hub/model/ProductVariantsStore';
import ProductVariantStore from 'common-modules/benefits-hub/model/ProductVariantStore';
import ProductsStore from 'common-modules/benefits-hub/model/ProductsStore';
import ProductStore from 'common-modules/benefits-hub/model/ProductStore';
import BenefitsHubImageStore from 'common-modules/benefits-hub/model/BenefitsHubImageStore';
import AudienceSponsorProgramsStore from 'common-modules/benefits-hub/model/AudienceSponsorProgramsStore';
import BenefitsStore from 'common-modules/benefits-hub/model/BenefitsStore';
import AudiencesStore from 'common-modules/benefits-hub/model/AudiencesStore';
import BenefitsProductsStore from 'common-modules/benefits-hub/model/BenefitsProductsStore';
import TranslationStore from 'common-modules/benefits-hub/model/TranslationStore';
import CompanyUsersStore from './CompanyUsersStore';
import CompanyRolesStore from './CompanyRolesStore';
import CompanyUserStore from './CompanyUserStore';
import DirectoryUsersStore from './DirectoryUsersStore';
import ClinicalInformationStore from './ClinicalInformationStore';
import UserNotificationsStore  from './UserNotificationsStore';
import ProfileStore  from './ProfileStore';
// import CasesTasksStore  from './CasesTasksStore';

export default class ModelStore {
  constructor() {
    this.restStore = new RESTStore();

    this.cloudinaryStore = new CloudinaryStore(this.restStore);

    this.configStore = new ConfigStore(this.restStore);
    if (!this.localesStore) {
      this.localesStore = new LocalesStore(this.restStore);
    }

    this.authStore = new AuthStore(this.restStore, this.configStore);

    if (!this.clinicalInformationStore) {
      this.clinicalInformationStore = new ClinicalInformationStore(
        this.restStore
      );
    }

    if(!this.profileStore)
	this.profileStore = new ProfileStore(
        this.restStore,
        this.authStore
      );

    this.sponsorStore = new SponsorStore(
      this.restStore,
      this.configStore,
      this.authStore,
      this.localesStore
    );
    if (!this.membersStore) {
      this.membersStore = new MembersStore(
        this.restStore,
        this.authStore,
        this.sponsorStore
      );
    }

    if (!this.memberStore) {
      this.memberStore = new MemberStore(
        this.restStore,
        this.authStore,
        this.sponsorStore
      );
    }
    if (!this.memberAccountStore) {
      this.memberAccountStore = new MemberAccountStore(
        this.restStore,
        this.authStore,
        this.sponsorStore,
        this.memberStore
      );
    }
    if (!this.userNotificationsStore) {
      this.userNotificationsStore = new UserNotificationsStore(
        this.restStore
      );
    }
    if (!this.sponsorshipsStore) {
      this.sponsorshipsStore = new SponsorshipsStore(
        this.restStore,
        this.authStore,
        this.sponsorStore
      );
    }
    if (!this.companyUsersStore) {
      this.companyUsersStore = new CompanyUsersStore(this.restStore);
    }
    if (!this.companyRolesStore) {
      this.companyRolesStore = new CompanyRolesStore(this.restStore);
    }
    if (!this.companyUserStore) {
      this.companyUserStore = new CompanyUserStore(
        this.restStore,
        this.authStore,
        this.sponsorStore
      );
    }
    if (!this.directoryUsersStore) {
      this.directoryUsersStore = new DirectoryUsersStore(this.restStore);
    }

    this.casesTasksStore = casesTasksStoreSingleton;
    casesTasksStoreSingleton.init(
      this.sponsorStore,
      this.restStore,
      this.authStore
    );

    this.notificationStore = new NotificationStore();
    this.versionStore = new VersionStore();
    this.preferencesStore = observable({
      sidePaneCollapsed: false,
      toggleSidePane() {
        this.sidePaneCollapsed = !this.sidePaneCollapsed;
      }
    });
    if (!this.productVariantStore) {
      this.productVariantStore = new ProductVariantStore(
        this.sponsorStore,
        this.restStore
      );
    }
    if (!this.productVariantsStore) {
      this.productVariantsStore = new ProductVariantsStore(
        this.sponsorStore,
        this.restStore
      );
    }

    if (!this.productsStore) {
      this.productsStore = new ProductsStore(
        this.sponsorStore,
        this.restStore,
        this.productVariantsStore
      );
    }

    if (!this.productStore) {
      this.productStore = new ProductStore(
        this.sponsorStore,
        this.restStore,
        this.productsStore
      );
    }

    if (!this.benefitsHubImageStore) {
      this.benefitsHubImageStore = new BenefitsHubImageStore(
        this.sponsorStore,
        this.restStore
      );
    }
    if (!this.benefitsStore) {
      this.benefitsStore = new BenefitsStore(this.sponsorStore, this.restStore);
    }

    if (!this.audienceSponsorProgramsStore) {
      this.audienceSponsorProgramsStore = new AudienceSponsorProgramsStore(
        this.sponsorStore,
        this.restStore
      );
    }

    if (!this.audiencesStore) {
      this.audiencesStore = new AudiencesStore(
        this.sponsorStore,
        this.restStore
      );
    }

    if (!this.benefitsProductsStore) {
      this.benefitsProductsStore = new BenefitsProductsStore(
        this.sponsorStore,
        this.restStore
      );
    }

    if (!this.translationStore) {
      this.translationStore = new TranslationStore(
        this.sponsorStore,
        this.restStore
      );
    }

  }

  init() {
    this.versionStore.start();
    this.configStore.init().then(() => this.authStore.authenticate());
  }

  destroy() {
    this.versionStore.stop();
    this.configStore.destroy();
  }
}

export const modelStoreSingleton = new ModelStore();
export const ModelStoreContext = createContext(modelStoreSingleton);
