import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import NotificationModalMenuComponent from './NotificationModalMenuCmp';
import NotificationListComponent from './NotificationListCmp';
import {
  Divider,
  Grid,
  Segment,
  Header,
  Loader,
  Dimmer,
  Icon
} from 'semantic-ui-react';
import { t } from 'translate'; 

const NotificationModalComponent = observer(({ userNotificationsStore, onItemClicked, NotificationIcon }) => {
  
  const getDefaultTab = () => {
    if (userNotificationsStore.messagingList.length > 0)
      return 'digital-message';
    if (userNotificationsStore.tasksList.length > 0)
      return 'task';
      if (userNotificationsStore.casesList.length > 0)
      return 'case';   
    return 'digital-message'; 
  }
  const items = [
    {
      id: 'digital-message',
      name: `Digital Messaging (${userNotificationsStore.unreadMessagingCount})`,
      iconName: 'comment alternate',
      style: { color: '#2987cd', float: 'left', margin: '0em 0.5em 0em 0em' },
      isIcon: true
    },
    {
      id: 'task',
      name: `Tasks (${userNotificationsStore.unreadTasksCount})`,
      iconName: 'tasks',
      style: { color: '#FF952C', float: 'left', margin: '0em 0.5em 0em 0em' },
      isIcon: true
    },
    {
      id: 'case',
      name: `Cases (${userNotificationsStore.unreadCasesCount})`,
      iconName: 'clipboard list',
      style: { color: '#FF952C', float: 'left', margin: '0em 0.5em 0em 0em' },
      isIcon: true
    }
  ];

  const getNotificationsBasedOnMenuItem = useCallback((id) => {
    switch (id) {
      case 'task':
        return userNotificationsStore.tasksList;
      case 'case':
        return userNotificationsStore.casesList;
      case 'digital-message':
        return userNotificationsStore.messagingList;
      default:
        return userNotificationsStore.notifications;
    }
  }, [userNotificationsStore]);

  const [tabMessages, setTabMessages] = useState(getNotificationsBasedOnMenuItem(getDefaultTab()));
  const [menuItem, setMenuItem] = useState(getDefaultTab());

  useEffect(() => {
    !userNotificationsStore.loading && setTabMessages(getNotificationsBasedOnMenuItem(menuItem))
  }, [userNotificationsStore.loading, menuItem, getNotificationsBasedOnMenuItem]);
  return (
    <React.Fragment>
      {userNotificationsStore.loading && (
        <Dimmer active inverted>
          <Loader inverted>t{('Loading')}</Loader>
        </Dimmer>
      )}
      <div>
        <Grid style={{ fontFamily: 'Lato' }}>
          <Grid.Row stretched>
            <Grid.Column width={16}>
              <Header as='h3'>
                <div style={{ fontSize: '18px' }}>
                  <Icon as={NotificationIcon} />
                  <span>
                    {` Notifications (${userNotificationsStore.unreadTotalCount} unread, `}{` ${userNotificationsStore.totalNotificationCount} total)`}
                  </span>
                </div>
              </Header>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Divider />
        <Grid
          columns={2}
          stackable
          className='fill-content'
          style={{ fontFamily: 'Lato' }}
        >
          <Grid.Row stretched>
            <Grid.Column width={4}>
              <NotificationModalMenuComponent
                items={items}
                defaultTab={getDefaultTab()}
                modal
                onTabChange={(id) => {
                  const noticesMenuElement = document.getElementsByClassName('notices-menu');
                  noticesMenuElement && noticesMenuElement[0] && noticesMenuElement[0].scroll(0, 0)
                  setMenuItem(id)
                }}
              />
            </Grid.Column>
            <Grid.Column width={12} style={{ fontFamily: 'Lato' }}>
              <Grid.Row>
                {tabMessages.length !== 0 && (
                  <Header as='h2'>
                    <div style={{ fontSize: 16, paddingLeft: 25 }}>
                      <span>
                        {` ${tabMessages.filter(({isRead})=>!isRead).length} unread, `}{` ${tabMessages.length} total`}
                      </span>
                    </div>
                  </Header>
                )}
              </Grid.Row>
              {tabMessages.length === 0 && (
                <Header as='h4' style={{ fontSize: 18, textAlign: 'center', marginTop: 0 }}>
                  {t('No Notifications')}
                </Header>
              )}
              {tabMessages.length > 0 && (
                <>
                  <Grid.Row>
                    <Segment basic style={{ paddingTop: 0 }}>
                      <NotificationListComponent
                        onItemClicked={onItemClicked}
                        messageList={tabMessages}
                        items={items}
                      />
                    </Segment>
                  </Grid.Row>
                </>
              )}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    </React.Fragment>
  );
});

export default NotificationModalComponent;