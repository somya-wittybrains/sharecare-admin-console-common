import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Container, Dropdown } from 'semantic-ui-react';
import { useAuthStore } from 'model/hooks';
import { t } from 'translate';

const debug = require('debug')('controls.PageHeader');

export default function PageHeader () {
  debug('render()');
  const authStore = useAuthStore();

  const authorizedFeatures = [];
  if (authStore.roles.indexOf('ADMIN') !== -1) {
    authorizedFeatures.push(
      <Menu.Item
        as={Link}
        key={`feature${authorizedFeatures.length}`}
        to='/accounts'
      >
        {t('Manage Accounts')}
      </Menu.Item>
    );
  }
  if (authStore.roles.indexOf('ADMIN') !== -1) {
    authorizedFeatures.push(
      <Dropdown
        pointing
        item
        text='Manage Access'
        key={`feature${authorizedFeatures.length}`}
      >
        <Dropdown.Menu>
          <Dropdown.Item as={Link} to='/access/roles'>
            {t('Find Roles')}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  return (
    <Menu fixed='top' inverted>
      <Container>
        <Menu.Item header>{t('Account Management System')}</Menu.Item>
        <Menu.Item as={Link} to='/'>
          {t('Home')}
        </Menu.Item>
        {authorizedFeatures}
        <Menu.Item
          as={Link}
          to='/'
          onClick={() => authStore.deAuthenticate(window.location)}
          position='right'
        >
          {t('Logout')}
        </Menu.Item>
      </Container>
    </Menu>
  );
}
