import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Menu,
  Popup,
  Loader,
  Icon
} from 'semantic-ui-react';
import { t } from 'translate';
import {
  useAppModelStore
} from 'model/hooks';
import NotificationModalComponent from './NotificationModalCmp';
import './UserNotifications.less';
import { ReactComponent as NotificationIcon } from 'assets/img/notices.svg';
import scws from 'scws';

const debug = require('debug')('controls.UserNotifications');

const UserNotifications = observer(({ history }) => {
  debug('render()');
  const { userNotificationsStore, authStore } = useAppModelStore();
  const [flagMessages, setFlagMessages] = useState(false);

  useEffect(() => {
    if (flagMessages)
      userNotificationsStore.search(authStore.accountId);
  }, [authStore.accountId, userNotificationsStore, flagMessages])

  useEffect(() => {
    const type = 'NOTIFICATION';
    let filter = [
      {
        type,
        agentSsoIds: authStore.accountId
      }
    ];
    userNotificationsStore.search(authStore.accountId);
    scws.addListener({
      filter,
      type,
      sponsor: '',
      onEvent: data => {
        userNotificationsStore.search(authStore.accountId);
      }
    });
    return () => {
      scws.removeListener({ filter, type });
    };
  }, [userNotificationsStore, authStore.accountId])

  return (
    <Popup
      key='top-nav-popup'
      className='tasks-menu'
      trigger={
        <Menu.Item>
          <div style={{ display: 'flex' }}>
            <Icon as={NotificationIcon} />
            <span>
              {t(' Notifications ')}
              {userNotificationsStore.loading && (
                <Loader
                  active={userNotificationsStore.loading}
                  size='mini'
                  inline
                />
              )}
              {!userNotificationsStore.loading &&
                `(${userNotificationsStore.unreadTotalCount})`}
            </span>
          </div>
        </Menu.Item>
      }
      content={
        <React.Fragment>
          <NotificationModalComponent
            userNotificationsStore={userNotificationsStore}
            onItemClicked={async (notification, options = {}) => {
              await userNotificationsStore.updateUserNotificationAsRead(notification.id);
              setFlagMessages(false);
              const entityUrl = options.isMemberUrl
                ? `/members/account/${notification.memberId}`
                : notification.targetUrl[0] !== '/'
                  ? `/${notification.targetUrl}`
                  : notification.targetUrl
              history.push(entityUrl);
            }}
            NotificationIcon={NotificationIcon}
          />
        </React.Fragment>
      }
      open={flagMessages}
      onOpen={() => setFlagMessages(true)}
      onClose={() => setFlagMessages(false)}
      position='bottom right'
      on='click'
    />
  );
});

export default UserNotifications;
