import React from 'react';
import {
  Item,
  Icon
} from 'semantic-ui-react';
import { t } from 'translate';
import { observer } from 'mobx-react-lite';
import './notifications.less';

const formDateStringForMessages = (date) => {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date
  const currentDate = new Date();
  const messageDate = new Date(date);
  if (currentDate.getMonth() === messageDate.getMonth() && currentDate.getFullYear() === messageDate.getFullYear()) {
    if (currentDate.getDate() === messageDate.getDate()) return t('Today');
    if (currentDate.getDate() - 1 === messageDate.getDate()) return t('Yesterday');
  }
  const [ year, month, day ] = [
    messageDate.toLocaleDateString('en-US', { year: 'numeric' }),
    messageDate.toLocaleDateString('en-US', { month: '2-digit' }),
    messageDate.toLocaleDateString('en-US', { day: '2-digit' })
  ]
  return `${year}/${month}/${day}`
}
const MessageItem = ({notification, menuMeta = [], onItemClicked}) => {
  const readClass = notification.isRead ? '' : 'unread';
  const iconData = menuMeta.find(({id})=> id === notification.entityType) || {};
  return (
    <li className={`${readClass}`}>
      <p className='text' style={{ marginBottom: '.5rem' }}>
        {notification.title}
        <span className='text' style={{ fontWeight: notification.isRead ? 500 : 900 }}>
          {formDateStringForMessages(notification.startDt)}
        </span>
      </p>
      <Item as='div' className='text-info'>
        <Icon name={iconData.iconName} style={iconData.style} />
        <Item as='a' style={{ cursor: 'pointer' }} onClick={()=>onItemClicked(notification)}>
          {notification.entityType === 'task' ? t('Task') : `${notification.entityid}`}
        </Item>
        <Item as='a' style={{ cursor: 'pointer' }} onClick={()=>onItemClicked(notification, { isMemberUrl: true })}>
          {`${notification.memberName}`}
        </Item>
      </Item>
    </li>);
}

const NotificationListComponent = observer(
  ({ messageList = [], items = [], onItemClicked }) => {
    return (
      <React.Fragment>
        <Item as='div' className='notices-menu'>
          <Item as='section'>
            <Item as='ul'>
              {messageList.map((item, index) => (<MessageItem key={index} onItemClicked={onItemClicked} notification={item} menuMeta={items}/>))}
            </Item>
          </Item>
        </Item>
      </React.Fragment>
    );
  }
);

export default NotificationListComponent;
