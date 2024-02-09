import { makeObservable, observable, action } from 'mobx';
import GenericStore from './GenericStore';
//import { removeMetricsSystemFromLocale } from 'utils';

const debug = require('debug')('model.LocalesStore');

export default class LocalesStore extends GenericStore {
  @observable defaultLocale = {};
  @observable availableLocales = [];
  //@observable availableLocalesWithoutMetrics = [];
  //@observable defaultLocaleWithoutMetrics = {};
  currentSponsorId;

  constructor (restStore) {
    debug('constructor()');
    super();
    makeObservable(this);
    this.restStore = restStore;
  }
  @action
  getLocale (sponsorId) {
    return this.restStore
      .fetch('/api/locales', {
        method: 'GET',
        query: {
          sponsor: sponsorId
        }
      })
      .then(
        action(({ supportedLocales: { locales = [], defaultLocale = {} } }) => {
          this.defaultLocale = defaultLocale;

          const allLocales = locales.filter(
            ({ localizedName }) => localizedName !== '__REMOVE_LOCALE__'
          );
          this.availableLocales = allLocales;
          /*this.defaultLocaleWithoutMetrics = {
            ...defaultLocale,
            locale: removeMetricsSystemFromLocale(defaultLocale.locale)
          };
          this.availableLocalesWithoutMetrics = allLocales.map(
            ({ locale, ...rest }) => ({
              ...rest,
              locale: removeMetricsSystemFromLocale(locale)
            })
          );*/
          this.currentSponsorId = sponsorId;
          this.error = '';
        })
      )
      .catch(err => this.handleError(err));
  }
}
