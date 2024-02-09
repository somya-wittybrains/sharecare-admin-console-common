import React, { useState } from 'react';
import { t } from 'translate';
import { Icon, Menu } from 'semantic-ui-react';
import { observer } from 'mobx-react-lite';

const NotificationModalMenuComponent = observer(({
  items,
  modal,
  defaultTab,
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <>
      <Menu
        vertical
        secondary={modal}
        style={{ fontSize: '14px', borderRadius: 0 }}
      >
        {items.map(item => {
          let menuItemTag = {
            borderRadius: 0,
            backgroundColor: activeTab === item.id ? '#FAFAFA' : '#FFFFFF',
            paddingRight: activeTab === item.id ? 0 : 13,
          }
          return (
            <Menu.Item
              id={item.id}
              key={item.id}
              active={activeTab === item.id}
              onClick={() => {
                setActiveTab(item.id);
                onTabChange(item.id);
              }}
              style={{...menuItemTag}}
            >
              {item.isIcon && (
                <Icon
                  name={item.iconName}
                  flipped={item.flipped}
                  style={item.style}
                />
              )}
              {!item.isIcon && (
                <Icon as={item.iconName} />
              )}

              <span
                style={{
                  color: '#000000',
                  fontWeight: activeTab === item.id ? 'bold' : ''
                }}
              >
                {t(item.name)}
                {activeTab === item.id && (
                  <span style={{ float: 'right' }}>
                    <Icon name='triangle right'></Icon>
                  </span>
                )}
              </span>
            </Menu.Item>
          );
        })}
      </Menu>
    </>
  );
});

export default NotificationModalMenuComponent;