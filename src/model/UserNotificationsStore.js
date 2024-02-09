import { makeObservable, observable, action, computed } from 'mobx';
import GenericStore from './GenericStore';

const debug = require('debug')('model.UserNotificationStore');

export default class UserteNotificationsStore extends GenericStore {

  @observable notifications = [];

  @computed
  get totalNotificationCount(){
    return this.notifications.length;
  }

  @computed
  get unreadCasesCount() {
    return this.casesList.filter(({isRead})=>!isRead).length;
  }

  @computed
  get unreadMessagingCount() {
    return this.messagingList.filter(({isRead})=>!isRead).length;
  }

  @computed
  get unreadTasksCount() {
    return this.tasksList.filter(({isRead})=>!isRead).length;
  }

  @computed
  get unreadTotalCount() {
    return this.unreadCasesCount + this.unreadMessagingCount + this.unreadTasksCount;
  }

  @computed
  get casesList() {
    return this.notifications.filter(({ entityType }) => entityType === 'case');
  }

  @computed
  get tasksList() {
    return this.notifications.filter(({ entityType }) => entityType === 'task');
  }

  @computed
  get messagingList() {
    return this.notifications.filter(({ entityType }) => entityType === 'digital-message');
  }

  constructor(restStore) {
    debug('constructor()');
    super();
    makeObservable(this);
    this.restStore = restStore;
  }



  @action
  updateUserNotificationAsRead(messageId) {
    this.loading = true;
    this.restStore
      .fetch(`/api/user-notifications-proxy/notifications`, {
        method: 'PATCH',
        body: JSON.stringify({ id: messageId, isRead: true })
      })
      .then(
        action(notification => {
          // update the old notificaiton record with the new one so that counts update 
          const oldNotification = this.notifications.find(({ id }) => id === messageId);
          if (oldNotification) {
            const index = this.notifications.indexOf(oldNotification);
            if (index !== -1) {
              this.notifications = [
                ...this.notifications.slice(0, index),
                notification,
                ...this.notifications.slice(index + 1)
              ]
            }
          }
          this.loading = false;
        })
      )
      .catch(err => this.handleError(err));
  }

  @action
  getUserNotifications(id) {
    this.loading = true;
    this.id = id;
    return this.restStore
      .fetch(`/api/user-notifications-proxy/notifications?recipientId=${id}`, {
        method: 'GET'
      })
      .then(
        action((notifications = []) => {
          this.loading = false;
          this.notifications = notifications;
        })
      )
      .catch(err => {
        this.notifications = [];
        this.handleError(err);
      });
  }

  search(id) {
    this.getUserNotifications(id)
  }
}
