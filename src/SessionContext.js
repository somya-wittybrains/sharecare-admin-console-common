import React from 'react';
import { observer } from 'mobx-react-lite';
import ResetSessionModal from './ResetSessionModal';

const SessionContext = observer(
  ({ children, restStore, authStore, configStore }) => {
    return (
      <React.Fragment>
        {configStore.ssoMethod === 'direct' && authStore.showReset && (
          <ResetSessionModal
            id='reset-session'
            authStore={authStore}
            restStore={restStore}
          />
        )}
        {children}
      </React.Fragment>
    );
  }
);

SessionContext.propTypes = {};

export default SessionContext;
