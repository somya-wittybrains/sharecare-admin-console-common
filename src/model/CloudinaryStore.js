import { makeObservable, action } from 'mobx';
import GenericStore from 'model/GenericStore';

const debug = require('debug')('model.CloudinaryStore');

export default class CloudinaryStore extends GenericStore {
  constructor(restStore) {
    super();
    makeObservable(this);
    this.restStore = restStore;
  }

  @action
  loadImages(category, meta, folder) {
    const paramsObject = {
      params: {
        folder,
        meta,
        tags:
          category !== ''
            ? Array.isArray(category)
              ? category
              : [category]
            : []
      }
    };
    return this.restStore
      .fetch('/api/cloudinary/images/find', {
        method: 'POST',
        body: JSON.stringify(paramsObject)
      })
      .catch(e => {
        this.handleError(e);
      });
  }

  @action
  getFolder(folder) {
    debug('getFolder()');

    return this.restStore
      .fetch(`/api/cloudinary/folder?folder=${folder}`, {
        method: 'POST',
        body: JSON.stringify({
          folder
        })
      })
      .then(
        action(folderEntries => {
          this.message = '';
          this.error = '';
          return folderEntries;
        })
      )
      .catch(err => this.handleError(err));
  }

  @action
  deleteFile(publicId) {
    debug('deleteFile()');

    return this.restStore
      .fetch(`/api/cloudinary/file?publicId=${publicId}`, {
        method: 'DELETE'
      })
      .then(
        action(() => {
          this.message = '';
          this.error = '';
          return {};
        })
      )
      .catch(err => this.handleError(err));
  }
}
