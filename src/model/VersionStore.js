import { makeObservable, observable, action, computed } from 'mobx';

const debug = require('debug')('model.VersionStore');

let currentBuildNumber = '';

export default class VersionStore {
  @observable currentVersion = '';
  @observable responseVersion = '';

  intervalId = null;
  
  constructor() {
    makeObservable(this);  
  }    

  fetchVersionInformation = async (self) => {
    window.fetch('/version.json', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).then(async response => {
        const result = await response.json();
        currentBuildNumber = result['version'];
    })
  }
  @action
  setBuildNumber() {
    if (!this.currentVersion) {
      this.currentVersion = currentBuildNumber;
    }
    this.responseVersion = currentBuildNumber;
  }
  @action
  start () {
    debug('start()');
    this.fetchVersionInformation(this);
    this.intervalId = setInterval(() => {
      this.fetchVersionInformation(this);
    }, 60000);
    this.buildNumberIntervalId = setInterval(() => {
      this.setBuildNumber();
    }, 10000);
  }

  stop () {
    debug('stop()');
    clearInterval(this.intervalId);
    clearInterval(this.buildNumberIntervalId);
    this.intervalId = null;
    this.buildNumberIntervalId = null;
  }

  @computed
  get current () {
    return this.currentVersion === this.responseVersion;
  }
}
