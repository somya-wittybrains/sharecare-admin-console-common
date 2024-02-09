import { createContext } from 'react';
import { makeObservable, observable, action } from 'mobx';

const debug = require('debug')('model.NotificationStore');

export default class NotificationStore {
  @observable notifications = [];

    makeObservable
  constructor() {
    makeObservable(this);
  }
  
  @action
  removeNotification(notificationId) {
    debug('removeNotification(notificationId=%d)', notificationId);

    this.notifications = this.notifications.filter(m => m.notificationId !== notificationId)
  }

  @action
  removeAllNotifications() {
    debug('removeAllNotifications');
    this.notifications = [];
  }

  @action
  removeNotificationOfType(type) {
    this.notifications = this.notifications.filter(m => m.type !== type);
  }

  /**
   *
   * @param {string} content - The content of the notification.
   * @param {Object} [options] - Optional values to control how the notification is handled.
   * @param {string} [options.type] - The type of notification. One of: info, success, warning, error.
   * @param {string} [options.header] - A header to add to the notification.
   * @param {number} [options.timeout] - Number of milliseconds the notification should be visible.
   * @param {number} [options.notificationId] - Explicitly set the id of this notification.
   *                                            This is helpful to prevent duplicate instances of the same notification being displayed to the user.
   */
  @action
  addNotification(content, options = {}) {
    debug('addNotification(content=%s, options=%o)', content, options);

    const notificationId = String(
      options.notificationId || Math.floor(Math.random() * 1000000000)
    );
    const { type, header } = options;
    this.removeNotification(notificationId);
    if (this.notifications.every(n => n.notificationId !== notificationId)) {
      this.notifications.push({
        notificationId,
        type,
        content,
        header
      });
    }
  }

  @action
  removeUnstickyNotifications() {
    debug('removeUnstickyNotifications()');

    this.notifications = this.notifications.filter(m => !m.sticky);
  }
}

// Provide own context to be re-usable across module boundaries
export const NotificationStoreContext = createContext(new NotificationStore());
