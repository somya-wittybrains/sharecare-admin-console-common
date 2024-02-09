import React from 'react';
import { t } from 'translate';
import PropTypes from 'prop-types';
import { useObserver } from 'mobx-react-lite';
import { Item, Popup, Icon } from 'semantic-ui-react';
import { useAppModelStore } from 'model/hooks';
import GlobalEventsListener from 'controls/GlobalEventsListener/GlobalEventsListener';
import { ReactComponent as CaretIcon } from './caret.svg';
import './SidePaneLayout.less';

function SidePaneLayout ({
  isAdvocateUser,
  side,
  children,
  sidePaneCollapsed: collapsed,
  toggleSidePane
}) {
  const onToggleFiveNineDialer = () => {
    GlobalEventsListener.dispatchEvent({ type: 'openFiveNineAdapter' });
  };
  return (
    <div
      className={`layout-sidepane layout-sidepane--left ${
        collapsed ? 'collapsed' : ''
      }`}
    >
      <Item className='layout-sidepane-pane'>
        <div className='sidepane-scrollable-area'>{side}</div>
      </Item>
      <Item className='layout-sidepane-content'>{children}</Item>
      <div className='sidepane-button-collapse' onClick={toggleSidePane}>
        <Popup
          inverted
          position='top center'
          content={collapsed ? t('Expand Menu') : t('Collapse Menu')}
          trigger={
            <CaretIcon
              width={20}
              style={{ transform: collapsed ? undefined : 'rotate(180deg)' }}
            />
          }
        />
      </div>
      {isAdvocateUser && (
        <div
          className='layout-sidepane-dialer'
          onClick={onToggleFiveNineDialer}
        >
          <div style={{ color: '#4a90e2', marginRight: '5px' }}>
            <Icon name='phone' flipped='horizontally' />
          </div>
          <div
            style={{ color: '#5c5d5d', fontWeight: 'bold', fontSize: '13px' }}
          >
            {t('Dialer')}
          </div>
        </div>
      )}
    </div>
  );
}

SidePaneLayout.propTypes = {
  side: PropTypes.node,
  children: PropTypes.node,
  sidePaneCollapsed: PropTypes.bool,
  toggleSidePane: PropTypes.func.isRequired
};

export default function ObserverSidePaneLayout (props) {
  const { preferencesStore, authStore } = useAppModelStore();
  const { isAdvocateUser } = authStore;

  return useObserver(() => (
    <SidePaneLayout
      {...props}
      isAdvocateUser={isAdvocateUser}
      sidePaneCollapsed={preferencesStore.sidePaneCollapsed}
      toggleSidePane={() => preferencesStore.toggleSidePane()}
    />
  ));
}
