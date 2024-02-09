import { makeObservable, observable, action } from 'mobx';
import GenericStore from './GenericStore';

export default class ProfileStore extends GenericStore {
   restStore = null;
   @observable status = 'NOT_STARTED';

  constructor(restStore, authStore) {
    super();
    makeObservable(this);  
    this.restStore = restStore;
    this.authStore = authStore;
  }

  @action
  fetchProfilingStatus() {
    this.loading = true;
    return this.restStore.fetch(`/api/profile/status?id=${this.authStore.accountId}`).then(
      action(
        ({status}) => {
	      this.status = status;
        this.loading = false;	              
	    }
      )
    ).catch(
      action(err => {
        this.loading = false;
      })
    );;
  }

  @action
  startProfiling() {
    this.loading = true;
    return this.restStore.fetch(`/api/profile/start?id=${this.authStore.accountId}`)
    .then(
      action(() => {
	    this.status = 'RUNNING';
      this.loading = false;	              
	    }
      )
    ).catch(
      action(err => {
        this.loading = false;
      })
    );
  }
  stopProfiling() {
    this.loading = true;
    return this.restStore.fetch(`/api/profile/stop?id=${this.authStore.accountId}`)
    .then(
      action(
        (profile) => {
          this.profile = profile;
	        this.status = 'NOT_STARTED';
          this.loading = false;	              
	}
      )
    ).catch(
      action(err => {
        this.loading = false;
      })
    );
  }

}
