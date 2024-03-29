import { makeObservable, observable, action } from 'mobx';
import qs from 'qs';
import { ACCESS_TIMEOUT } from '../utils';
const debug = require('debug')('model.RESTStore');

const buildOptions = options => {
  debug('buildOptions(%o)', options);
  const standard = {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    },
    credentials: 'include',
    mode: 'same-origin'
  };

  if (options.headers) {
    options.headers = { ...standard.headers, ...options.headers };
  }

  return { ...standard, ...options };
};

const responseErrorMsg = (response, body) => {
  if (body && body.error_description) {
    return body.error_description;
  } else if (body && body.error) {
    return body.error;
  } else {
    return `${response.status} - ${JSON.stringify(body)}`;
  }
};

export default class RESTStore {
  @observable timestamp = Date.now();
  @observable expired = false;
  @observable status = 200;
  @observable error = '';
  @observable progress = 0.0;
  @observable uploadError = '';
  accountId = '';
  refreshPromise = null;

  timeoutId = null;

  constructor() {
    debug('constructor()');
    makeObservable(this);
  }

  @action
  fetch(url, options = {}, recordActivity = true) {
    return new Promise(async (resolve, reject) => {
      debug('fetch(%o,%o)', url, options);
      const { query, skip401 = false, ...requestOptions } = options;
      if (query && Object.keys(query).length > 0) {
        url +=
          (url.indexOf('?') === -1 ? '?' : '&') +
          qs.stringify(query, { skipNulls: true });
      }

      try {
        if (!options.skipRefresh && recordActivity) await this.refresh();
      } catch (e) {
        reject(e);
        return;
      }
      if (!requestOptions.headers) {
        requestOptions.headers = {};
      }
      requestOptions.headers['accountid'] = this.accountId;
      return window.fetch(url, buildOptions(requestOptions)).then(response => {
        if (skip401 && Number(response.status) === 401) {
          this.status = 200;
        } else this.status = response.status;

        if (response.ok) {
          this.error = '';
          resolve(response.status === 204 ? undefined : response.json());
        } else {
          if (response.status === 504) {
            // Specific handling for gateway timeout
            return response.text().then(message => {
              const errorRef = new Error(message);
              errorRef.body = { error: message };
              reject(errorRef);
            });
          }
          return response.json().then(body => {
            this.error = responseErrorMsg(response, body);
            const errorRef = new Error(this.error);
            errorRef.status = response.status;
            errorRef.body = body;
            reject(errorRef);
          });
        }
      });
    });
  }

  @action
  upload(url, file, options = {}, recordActivity = true) {
    return new Promise(async (resolve, reject) => {
      debug('upload(%s,%s,%o,%s)', url, file, options, recordActivity);

      const { method = 'POST', query, headers = {}, ...data } = options;
      if (query && Object.keys(query).length > 0) {
        url +=
          (url.indexOf('?') === -1 ? '?' : '&') +
          qs.stringify(query, { skipNulls: true });
      }

      try {
        if (!options.skipRefresh && recordActivity) await this.refresh();
      } catch (e) {
        reject(e);
        return;
      }

      const xhr = new window.XMLHttpRequest();
      const fd = new window.FormData();
      xhr.open(method, url, true);
      Object.entries(headers).forEach(([key, value]) =>
        xhr.setRequestHeader(key, value)
      );

      xhr.upload.addEventListener(
        'progress',
        action(event => {
          this.progress = Math.round((event.loaded * 100.0) / event.total);
        })
      );

      xhr.addEventListener(
        'error',
        action(err => {
          this.uploadError = err.message;
          reject(err);
        })
      );

      xhr.onreadystatechange = () => {
        this.status = xhr.status;

        if (xhr.readyState === 4 && xhr.status === 200) {
          this.uploadError = '';
          resolve(JSON.parse(xhr.responseText));
        }
        if (xhr.readyState === 4 && xhr.status !== 200) {
          this.uploadError = xhr.responseText;
          reject(JSON.parse(xhr.responseText));
        }
      };

      Object.entries(data).forEach(([key, value]) => {
        fd.append(key, JSON.stringify(value));
      });
      fd.append('file', file);
      xhr.send(fd);
    });
  }

  @action
  clearTimeout() {
    clearTimeout(this.timeoutId);
    this.resetExpired();
  }

  @action
  resetExpired() {
    this.expired = false;
  }

  @action
  clearError() {
    this.status = 200;
    this.error = '';
    this.uploadError = '';
  }

  @action
  async refresh(forceRefresh = false) {
    debug('refresh()');

    // If we currently have a refresh call in progress, we should return that Promise as to prevent
    // a race condition where multiple refresh calls are occurring at the same time.
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // The current token is still fresh
    if (!forceRefresh && this.getLastRefresh() + ACCESS_TIMEOUT > Date.now()) {
      return Promise.resolve();
    }

    this.updateLastRefresh();
    this.refreshPromise = new Promise(async (resolve, reject) => {
      const response = await window.fetch(
        '/api/auth/refresh',
        buildOptions({
          method: 'POST'
        })
      );
      if (response.status === 200) {
        this.expired = false;
        resolve();
      } else if (response.status === 500) {
        //Do nothing for refresh_token not initiated cases
        resolve();
      } else {
        this.expired = true;
        const body = await response.json();
        this.error = responseErrorMsg(response, body);
        const error = new Error(this.error);
        error.status = response.status;
        error.body = body;
        reject(error);
      }
    }).finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  // This information must be stored in local storage for cross browser tab syncing.
  // One tab refreshing and another one not knowing about it could lead to the user
  // being erroneously logged out.
  getLastRefresh() {
    const lastRefreshTime = Number(
      window.localStorage.getItem('auth.lastRefreshed')
    );
    return isNaN(lastRefreshTime) ? 0 : lastRefreshTime;
  }

  updateLastRefresh() {
    debug('updateLastRefresh()');
    window.localStorage.setItem('auth.lastRefreshed', Date.now());
  }

  clearLastRefresh() {
    debug('clearLastRefresh()');
    window.localStorage.removeItem('auth.lastRefreshed');
  }
}
