import React from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import { Message } from 'semantic-ui-react';
import { useNotificationStore } from 'model/hooks';
import './Notifications.css';

const debug = require('debug')('controls.Notifications');

export default function Notifications () {
  debug('render()');

  const notificationStore = useNotificationStore();
  const { notifications } = notificationStore;

  return (
    <div className='notifications'>
      <CSSTransitionGroup
        transitionName='notification'
        transitionEnterTimeout={500}
        transitionLeaveTimeout={300}
      >
        {notifications.map(notification => {
          const additionalProps = notification.type
            ? { [notification.type]: true }
            : {};
          return (
            <Message
              {...additionalProps}
              key={'notification' + notification.notificationId}
              header={notification.header}
              content={notification.content}
              onDismiss={() => {
                notificationStore.removeNotification(
                  notification.notificationId
                );
              }}
            />
          );
        })}
      </CSSTransitionGroup>
    </div>
  );
}
