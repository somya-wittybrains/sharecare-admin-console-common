import React, { useEffect, useState, useCallback } from 'react';
import { Message } from 'semantic-ui-react';
import GlobalEventsListener from 'controls/GlobalEventsListener/GlobalEventsListener';

let count = 0;

const GlobalNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const onAddGlobalNotification = useCallback(({ type, content, header }) => {
    const addToNotifications = [...notifications];
    const id = `global-notification-${count++}`;
    addToNotifications.push({
      id,
      type,
      content,
      header
    });
    setNotifications(addToNotifications);
  }, [notifications]);

  useEffect(() => {
    GlobalEventsListener.addListener({
      type: 'addGlobalNotification',
      onEvent: onAddGlobalNotification,
      isReplace: true
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onAddGlobalNotification]);

  const onDismissNotification = id => {
    const dismissNotifications = [...notifications];
    setNotifications(dismissNotifications.filter(m => m.id !== id));
  };

  const containerStyle = {
    position: 'absolute',
    top: '0px',
    left: '0px',
    right: '0px',
    width: '90%',
    zIndex: '102',
    marginTop: '10px',
    marginLeft: 'auto',
    marginRight: 'auto'
  };

  return (
    <>
      {notifications.length > 0 && (
        <div style={containerStyle}>
          {notifications.map(({ id, type, content, header }) => {
            return (
              <Message
                key={id}
                positive={type === 'positive'}
                negative={type === 'negative'}
                info={type === 'info'}
                content={content}
                header={header}
                onDismiss={() => onDismissNotification(id)}
              />
            );
          })}
        </div>
      )}
    </>
  );
};
export default GlobalNotifications;