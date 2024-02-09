import React, { useState, useEffect } from 'react';
import { t } from 'translate';
import { Button, Header, Icon, Popup, Message, Loader } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import EnumField from 'controls/form/fields/EnumField';
import './TopNavAdvocateAccountContent.css';
import { ReactComponent as OfflineIcon } from 'controls/icon_cloud_off.svg';
import ProfileTag from 'controls/ProfileTag';
import { observer } from 'mobx-react-lite';

export default observer(
  ({
    authStore = {},
    profileStore,
    onEditAccountClicked,
    status,
    onStatusSelected,
    statusOptions = [],
    isLoggedInToFive9,
    isAdvocateUser,
    advocatePresenceLoading,
    advocatePresenceChangeError,
    setAdvocatePresenceChangeError,
    history
  }) => {
    const { firstName, lastName, email = '', profileName } = authStore;
    // Enable profiling for some select emails as of now 
    const showProfile = ['jonathan.field@sharecare.com', 'pawan.jhurani@sharecare.com', 'jimmy.cretney@sharecare.com', 'vivek.srivastava@sharecare.com'].includes(email.toLowerCase());

    const name = `${firstName} ${lastName}`;

    const getOfflineIcon = () => {
      return (
        <Popup
          inverted
          trigger={<Icon as={OfflineIcon} style={{ marginLeft: '10px' }} />}
          content={t('Dialer User Offline or Login Session Expired')}
        />
      );
    };

    const [options, setOptions] = useState([]);
    useEffect(() => {
      const opts = statusOptions.map(
        ({ id, status, substatus, color, icon }) => {
          // Only use substatus if its different then the status
          const diffSubstatus = status !== substatus ? substatus : '';
          const formattedSubstatus = diffSubstatus ? ` - ${substatus}` : '';
          const text = `${status}${formattedSubstatus}`;

          const isDisabled = !isLoggedInToFive9 && id !== -1; /* Offline */

          let specialIcon;
          if (icon === 'phone') {
            specialIcon = (
              <div style={{ color: isDisabled ? '#929292' : color }}>
                <Icon name='phone' />
              </div>
            );
          } else if (icon === 'text') {
            specialIcon = (
              <div style={{ color }}>
                <Icon name='chat' />
              </div>
            );
          }

          return {
            value: id,
            text: (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                  fontFamily:
                    "'Lato', 'Helvetica Neue', Arial, Helvetica, sans-serif"
                }}
              >
                <div
                  style={{
                    color: isDisabled ? '#929292' : color,
                    marginRight: '10px'
                  }}
                >
                  <Icon name='user' />
                </div>
                <div
                  style={{
                    flex: 1,
                    color: isDisabled ? '#929292' : undefined
                  }}
                >
                  {text}
                </div>
                {specialIcon && specialIcon}
                {id === -1 /* Offline */ && getOfflineIcon()}
              </div>
            )
          };
        }
      );
      setOptions(opts);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusOptions, isLoggedInToFive9]);

    useEffect(()=>{
      profileStore.fetchProfilingStatus();
    }, [])

    return (
      <React.Fragment>
        {advocatePresenceChangeError && (
          <Message
            negative
            size='mini'
            content={advocatePresenceChangeError}
            onDismiss={() => setAdvocatePresenceChangeError(null)}
          />
        )}
        <div style={{ padding: '5px', width: '300px' }}>
          <Header as='h3' style={{ whiteSpace: 'nowrap', marginBottom: 10 }}>
            {name}
          </Header>
          <div
            style={{
              marginBottom: 10,
              fontSize: '12px',
              color: '#2987cd',
              textDecoration: 'underline'
            }}
          >
            {email}
          </div>
          {isAdvocateUser && profileName && (
            <React.Fragment>
              <ProfileTag profileName={profileName} />
              <div style={{ height: 10 }} />
            </React.Fragment>
          )}
          <div
            className='advocate-status-enum-wrapper'
            style={{
              padding: '10px 0px',
              display: 'flex',
              justifyContent: advocatePresenceLoading ? 'center' : 'flex-start' }}
          >
            {advocatePresenceLoading
              ? <Loader active size='mini' inline />
              : isAdvocateUser &&
                <EnumField
                  id='advocateStatus'
                  fieldStyle={{ flex: 1 }}
                  value={status}
                  options={options}
                  onChange={s => onStatusSelected(s)}
                />
            }
          </div>
          {showProfile && !profileStore.loading && (
            <div>
            <Button 
              primary
              type='button'
              disabled={profileStore.status === 'RUNNING'}
              content={t('Start Profiling')}
              onClick={() => {
                profileStore.startProfiling();
                document.getElementById('account-menu').click();
              }}
            />

            <Button 
              primary
              type='button'
              disabled={profileStore.status === 'NOT_STARTED'}
              content={t('End Profiling')}
              onClick={() => {
                  profileStore.stopProfiling().then(()=>{
                  document.getElementById('account-menu').click();
                  const link = document.createElement('a');
                  const file = new Blob([JSON.stringify(profileStore.profile)], { type: 'text/plain' });
                  link.href = URL.createObjectURL(file);
                  link.download = `${authStore.accountId}.cpuprofile`;
                  link.click();
                  URL.revokeObjectURL(link.href);
                });
              }}
            />
          </div>
          )}
          <div style={{ paddingTop: 10 }}>
            <Link onClick={onEditAccountClicked} to='/account'>
              <Icon name='cog' />
              {t('Edit Account Settings')}
            </Link>
          </div>
        </div>
      </React.Fragment>
    );
  }
);
