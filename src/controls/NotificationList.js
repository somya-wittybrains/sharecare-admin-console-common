import React from 'react';
import PropTypes from 'prop-types';
import { Message } from 'semantic-ui-react';
import RemoteErrorMessage from 'controls/RemoteErrorMessage';
import { useObserver } from 'mobx-react-lite';
import { useNotificationStore } from 'model/hooks';

const Notification = ({ content, type, onDismiss }) => {
  const Component = type === 'error' ? RemoteErrorMessage : Message;

  // TBD for now info, warning and success map to positibe style. In future we would do seperate styles for
  // each type of notification
  const messageProps =
    type === 'error'
      ? {
          rejected: content
        }
      : {
          content,
          positive: type === 'warning' || type === 'info' || type === 'success'
        };
  return <Component {...messageProps} onDismiss={onDismiss} />;
};
Notification.propTypes = {
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Error)])
    .isRequired,
  type: PropTypes.oneOf(['error', 'warning', 'info', 'success']).isRequired,
  onDismiss: PropTypes.func
};

// Display all messages from a notification store.
// The store comes from the context to allow each module to have its own.
export function NotificationList ({ notifications, removeNotification }) {
  return (
    <>
      {notifications.map(({ notificationId, ...notification }) => {
        return (
          <Notification
            key={notificationId}
            {...notification}
            onDismiss={() => removeNotification(notificationId)}
          />
        );
      })}
    </>
  );
}
NotificationList.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      notificationId: PropTypes.string.isRequired
    })
  ),
  removeNotification: PropTypes.func.isRequired
};

export default function NotificationListWithContext () {
  const notificationStore = useNotificationStore();

  return useObserver(() => (
    <NotificationList
      key={`notifications_${notificationStore.notifications.length}`}
      notifications={notificationStore.notifications}
      removeNotification={notificationStore.removeNotification.bind(
        notificationStore
      )}
    />
  ));
}
