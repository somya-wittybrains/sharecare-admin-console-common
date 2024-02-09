import { observable, action, set, remove } from 'mobx';

const debug = require('debug')('model.InjectableStore');

export default class InjectableStore {
  @observable state = {};

  constructor () {
    debug('constructor()');
  }

  @action
  setProperty (key, value) {
    debug('setProperty(%s,%o)', key, value);

    set(this.state, key, value);
  }

  @action
  clearProperty (key) {
    debug('clearProperty(%s)', key);

    remove(this.state, key);
  }
}
