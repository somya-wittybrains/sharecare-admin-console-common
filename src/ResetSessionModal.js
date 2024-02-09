import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Modal, Button, Icon } from 'semantic-ui-react';
import { t } from 'translate';
import { REFRESH_TIMEOUT } from './utils';
import './ResetSessionModal.css';

const ResetSessionModal = observer(({ id, restStore, authStore }) => {
  const [busy, setBusy] = useState(false);
  const [time, setTime] = useState('');
  const modalRef = useRef({});
  const getFormattedTime = time => {
    if (+time >= 0) {
      const min = Math.floor((time / 1000 / 60) << 0);
      let sec = Math.floor((time / 1000) % 60);
      if (sec <= 9) sec = `0${sec}`;
      return `${min}:${sec}`;
    }
    return '0:00';
  };
  const setCurrentTime = () => {
    setTimeout(() => {
      if (restStore.expired) {
        setTime('0:00');
        return;
      }
      const remTime = restStore.getLastRefresh() + REFRESH_TIMEOUT - Date.now();
      if (remTime >= 0) {
        setTime(getFormattedTime(remTime));
        setCurrentTime();
      } else setTime('0:00');
    }, 500);
  };
  useEffect(() => {
    setCurrentTime();
    try {
      if (
        document.getElementById('reset-session') &&
        document.getElementById('reset-session').offsetParent &&
        document.getElementById('reset-session').offsetParent.classList
      )
        document
          .getElementById('reset-session')
          .offsetParent.classList.add('reset-session-zindex');
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal
      id={id}
      ref={modalVal => (modalRef.current = modalVal)}
      open
      size='tiny'
      closeOnDimmerClick={false}
      className='reset-session'
    >
      <Modal.Header>
        {t('Session Timeout')} <Icon name='clock outline' />
      </Modal.Header>
      <Modal.Content>
        <p>
          Your user session will expire in{' '}
          <span style={{ color: '#006bb8' }}>{time}</span> due to inactivity.
        </p>
        <p>
          Select <b>Continue</b> to extend and resume your session or select{' '}
          <b>Log Out</b> to end the current session.
        </p>
        <p>
          <b>Do you want to continue?</b>
        </p>
      </Modal.Content>
      <Modal.Actions className='flex-space'>
        <Button
          primary
          type='button'
          content={t('Log Out')}
          onClick={() => {
            authStore.showSessionError = false;
            if (!busy) authStore.logout();
          }}
        />
        <Button
          secondary
          loading={busy}
          content={t('Continue')}
          onClick={async () => {
            setBusy(true);
            authStore.showSessionError = false;
            setTimeout(async () => {
              await restStore.refresh(true);
              setBusy(false);
            }, 500);
          }}
        />
      </Modal.Actions>
    </Modal>
  );
});

export default ResetSessionModal;
