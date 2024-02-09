import { makeObservable, observable, action } from 'mobx';
import GenericStore from 'model/GenericStore';
const debug = require('debug')('model.CompanyRolesStore');

export default class CompanyRolesStore extends GenericStore {
  @observable ready = false;
  @observable roles = [];

  constructor(restStore) {
    debug('constructor()');
    super();
    makeObservable(this);
    this.restStore = restStore;
  }

  @action
  load() {
    debug('load()');

    this.loading = true;

    return this.restStore
      .fetch('/api/site/roles')
      .then(
        action(roles => {
          //ADV-7110 stub code
          /* const memberPermissions = roles.find(({module})=>module === 'member-management');
          if (memberPermissions) {
            memberPermissions.roles = [...memberPermissions.roles, 'CONSOLE_MEMBER_DOCUMENTS_EDIT', 'CONSOLE_MEMBER_DOCUMENTS_DELETE', 'CONSOLE_MEMBER_DOCUMENTS_VIEWER', 'CONSOLE_MEMBER_DOCUMENTS_DOWNLOAD'];
          } */
          //ADV-7110 stub code
          this.roles = roles;
          this.error = '';
          this.loading = false;
          this.ready = true;
        })
      )
      .catch(
        action(() => {
          this.roles = [];
          this.error = 'Could not load company roles';
          this.loading = false;
        })
      );
  }
}
