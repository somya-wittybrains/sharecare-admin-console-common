import React, { useState, useEffect } from 'react';
import { t } from 'translate';
import { Menu, Icon, Popup } from 'semantic-ui-react';
import { getErrorMessage } from 'utils';
import TopNavAdvocateAccountContent from './TopNavAdvocateAccountContent';
import GlobalEventsListener from 'controls/GlobalEventsListener/GlobalEventsListener';
import { modelStoreSingleton } from '../model';
import { observer } from 'mobx-react-lite';
const { restStore } = modelStoreSingleton;

export default observer(({ authStore, profileStore, history }) => {
  const { permissions = [], profiles = [], profileName } = authStore;
  const advocacyPermissions =
    (permissions.find(p => p.module === 'advocacy') || {}).roles || [];
  const isAdvocateUser = advocacyPermissions.length > 0;

  const [isAccountPopOpen, setIsAccountPopOpen] = useState(false);
  const [status, setStatus] = useState(-1 /* Offline */);
  const [statusHolder] = useState({});
  statusHolder.status = status;
  const [statusOptions, setStatusOptions] = useState([]);
  const [isLoggedInToFive9, setIsLoggedInToFive9] = useState(false);
  const [advocatePresenceLoading, setAdvocatePresenceLoading] = useState(false);
  const [advocatePresenceChangeError, setAdvocatePresenceChangeError] = useState(null);

  useEffect(() => {
    const type = 'fiveNineLoginStatusChange';
    const onEvent = fiveNineLoginStatus => {
      setIsLoggedInToFive9(fiveNineLoginStatus);
    };
    GlobalEventsListener.addListener({
      type,
      onEvent
    });
    return () => {
      GlobalEventsListener.removeListener({
        type,
        onEvent
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const type = 'fiveNinePresenceIdChangeFromFive9WrapperApi';
    const onEvent = ({ presenceId, dt }) => {
      const status = statusHolder.status;
      if (dt && dt < statusHolder.dt + 2000) {
        return; // To prevent problems from a particular race condition, ignore status updates that are effectively older than when the user last manually changed their status in the CC status selector, or that are reported within 2 seconds of such a manual status change.
      }
      if (presenceId && presenceId !== status) {
        setStatus(presenceId);
      }
    };
    GlobalEventsListener.addListener({
      type,
      onEvent
    });
    return () => {
      GlobalEventsListener.removeListener({
        type,
        onEvent
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusData = async () => {
    try {
      const data = await restStore.fetch(
        '/api/advocacyproxy-five9/agent-presence-master',
        {
          method: 'GET'
        }
      );
      setStatusOptions(data);
    } catch (e) {
      setStatusOptions([]);
    }
  };

  const getInitialStatus = async () => {
    try {
      setAdvocatePresenceLoading(true);
      const { presenceId, error } = await restStore.fetch(
        '/api/advocacyproxy-five9/agent-presence/my',
        {
          method: 'GET'
        }
      );
      error && setAdvocatePresenceChangeError(getErrorMessage(error));
      presenceId && setStatus(presenceId || -1 /* Offline */);
      setAdvocatePresenceLoading(false);
    } catch (e) {
      setAdvocatePresenceLoading(false);
      setAdvocatePresenceChangeError(getErrorMessage(e));
    }
  };

  const setFive9Status = async s => {
    try {
      setAdvocatePresenceLoading(true);
      console.debug(`CC: In TopNavAccountMenuItem:setFive9Status Status: ${s} SsoID: ${authStore.accountId} at ${new Date().toISOString()}`);
      const { executeRestApi, error } = await restStore.fetch(
        '/api/advocacyproxy-five9/agent-presence/my',
        {
          method: 'POST',
          body: JSON.stringify({
            presenceId: s
          })
        }
      );
      error && setAdvocatePresenceChangeError(getErrorMessage(error));
      if (s === -1 /* Offline */) {
        GlobalEventsListener.dispatchEvent({
          type: 'fiveNineForceLogout'
        });
      }
      if (executeRestApi) {
        const interactionApi = window.Five9?.CrmSdk?.interactionApi();
        if (interactionApi) {
          console.debug(`CC: In TopNavAccountMenuItem:setFive9Status SsoID: ${authStore.accountId} status update response included executeRestApi: ${JSON.stringify(executeRestApi)} at ${new Date().toISOString()}`);
          interactionApi.executeRestApi(executeRestApi);
        } else {
          console.error('Five9 telephony adapter has not loaded!!!');
        }
      }
      setAdvocatePresenceLoading(false);
    } catch (e) {
      setAdvocatePresenceLoading(false);
      setAdvocatePresenceChangeError(getErrorMessage(e));
    }
  };

  const onStatusSelected = s => {
    if (
      !isLoggedInToFive9 &&
      parseInt(s) !==
        -1 /* Offline */ /* Note:  Status should already be 'Offline' if not logged in to Five9, but in case a discrepancy arises, allow the user to select 'Offline' anyway. */
    ) {
      alert('You need to log in to Five9 to use this status.');
    } else {
      setStatus(s);
      statusHolder.dt = new Date().valueOf();
      console.debug(`CC: In TopNavAccountMenuItem:onStatusSelected Status: ${s} SsoID: ${authStore.accountId} at ${new Date().toISOString()}`);
      setFive9Status(s);
      // setIsAccountPopOpen(false)
    }
  };

  useEffect(() => {
    const initApiCalls = async () => {
      if (isAdvocateUser) {
        await getStatusData();
        getInitialStatus();
      }
    };
    initApiCalls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusObj = statusOptions.find(({ id }) => id === status) || {};

  const { color: statusColor = '#929292', icon } = statusObj;
  const color =
    !isLoggedInToFive9 && icon === 'phone' ? '#929292' : statusColor;

  return (
    <Popup
      className='advocate-account-menu'
      trigger={
        <Menu.Item as='a' id='account-menu'>
          <Icon name='user' style={{ color }} />
          {t('Account')}
        </Menu.Item>
      }
      content={
        <TopNavAdvocateAccountContent
          history={history}
          profileStore={profileStore}
          profileName={profileName}
          profiles={profiles}
          isAdvocateUser={isAdvocateUser}
          status={status}
          statusOptions={statusOptions}
          isLoggedInToFive9={isLoggedInToFive9}
          authStore={authStore}
          onStatusSelected={onStatusSelected}
          onEditAccountClicked={() => setIsAccountPopOpen(false)}
          advocatePresenceLoading={advocatePresenceLoading}
          advocatePresenceChangeError={advocatePresenceChangeError}
          setAdvocatePresenceChangeError={setAdvocatePresenceChangeError}
        />
      }
      wide
      open={isAccountPopOpen}
      onOpen={() => setIsAccountPopOpen(true)}
      onClose={() => setIsAccountPopOpen(false)}
      position='bottom right'
      on='click'
    />
  );
});
