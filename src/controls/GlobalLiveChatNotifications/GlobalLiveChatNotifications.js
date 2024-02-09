import React, { useEffect, useState } from 'react';
import { t } from 'translate';
import { Message, Icon } from 'semantic-ui-react';
import scws from 'scws';
import { useAppModelStore } from 'model/hooks';
import TimeDisplay from './TimeDisplay';
import { useHistory } from 'react-router-dom';

export default () => {
  const { sponsorStore, authStore } = useAppModelStore();
  const sponsor = sponsorStore.sponsor && sponsorStore.sponsor.id;

  const { accountId: myAccountId } = authStore;

  const [notificationData, setNotificationData] = useState();

  const [chatCount, setChatCount] = useState(0);

  const [notice, setNotice] = useState();

  const checkDataForCountIncrease = data => {
    const {
      data: { agentInfo }
    } = data;
    setChatCount(agentInfo[myAccountId]?.totalLiveChats || 0);
  };

  /*
   * Example of data format used for testing
   *
  useEffect(() => {
    setTimeout(() => {
      const testData = {
        memberSecureId:
          'J2uSDhhdunmQDpPX7445AP-5zHWc-HDDidR1gxIZitqA3Xzo_mofXo4y9-zGtGPu0I7LGtyaU-64kt4Sb180EA',
        memberSsoId: crypto.randomUUID(),
        type: 'LIVE_CHAT',
        data: {
          topicId: 2,
          queueId: 1,
          advocateGroup: 'Advocate',
          agentSsoIds: 'd5479c02-c2ce-4dfa-ac0d-5999a293c4e4'
        }
      };
      setNotificationData(testData);
      checkDataForCountIncrease(testData);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  */

  useEffect(() => {
    const type = 'LIVE_CHAT';
    let filter = [
      {
        type,
        agentSsoIds: myAccountId
      }
    ];

    scws.addListener({
      filter,
      type,
      sponsor,
      onEvent: data => {
        setNotificationData(data);
        checkDataForCountIncrease(data);
      }
    });

    return () => {
      // console.log('top level live chat listener removed')
      scws.removeListener({ filter, type });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sponsor]);

  const history = useHistory();
  const onCloseNotification = () => {
    history.push(`/messaging?queue=${notificationData.data.queueId}`);
    setNotificationData(undefined);
    setChatCount(0);
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

  const onTimeChange = time => {
    let desiredNotice = '';
    if (time >= 90) {
      desiredNotice = 'WAITING_LIVE_CHAT_URGENT';
    } else if (time >= 60) {
      desiredNotice = 'WAITING_LIVE_CHAT_ATTENTION';
    } else {
      desiredNotice = 'WAITING_LIVE_CHAT_NEW';
    }
    if (desiredNotice !== notice) {
      setNotice(desiredNotice);
    }
  };

  const formatNotification = () => {
    if (notificationData && chatCount > 0) {
      const isMultiple = chatCount > 1;
      const notificationMessagePrefix = isMultiple ? `(${chatCount}) ` : '';

      let notificationMessage;
      if (notice === 'WAITING_LIVE_CHAT_URGENT') {
        notificationMessage = `${notificationMessagePrefix}${t(
          `URGENT Chat${isMultiple ? 's' : ''} Need${
            isMultiple ? '' : 's'
          } Attention`
        )}`;
      } else if (notice === 'WAITING_LIVE_CHAT_ATTENTION') {
        notificationMessage = `${notificationMessagePrefix}${t(
          `Chat${isMultiple ? 's' : ''} Need${isMultiple ? '' : 's'} Attention`
        )}`;
      } else {
        notificationMessage = `${notificationMessagePrefix}${t(
          `New Chat${isMultiple ? 's' : ''} In Queue`
        )}`;
      }

      const notificationContent = (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Icon style={{ marginTop: '-2px' }} name='chat' />
          <div style={{ padding: '0px 10px' }}>{notificationMessage}</div>
          <div style={{ height: '10px', borderRight: '1px solid #ffffff' }}>
            &nbsp;
          </div>
          <div
            style={{
              padding: '0px 10px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={onCloseNotification}
          >
            {t('View Coaching Chat Queue')}
          </div>
          <div style={{ flex: 1 }}>&nbsp;</div>
          <TimeDisplay onTimeChange={onTimeChange} />
        </div>
      );

      let background = '';
      if (notice === 'WAITING_LIVE_CHAT_URGENT') {
        background = '#cc2029';
      } else if (notice === 'WAITING_LIVE_CHAT_ATTENTION') {
        background = '#f0712c';
      } else {
        background = '#2987cd';
      }

      return (
        <div style={containerStyle}>
          <Message
            style={{ color: '#ffffff', background }}
            content={notificationContent}
          />
        </div>
      );
    } else {
      return <></>;
    }
  };

  return formatNotification();
};
