import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'semantic-ui-react';
import { t } from 'translate';

const RepoSelector = ({ disabled = false, onChange, value }) => (
  <Menu secondary pointing className='mtb-25'>
    <Menu.Item
      name='UAT Environment'
      active={value === 'uat'}
      onClick={() => onChange('uat')}
      disabled={disabled}
    >
      {t('UAT Environment')}
    </Menu.Item>
    <Menu.Item
      name='Production Environment'
      active={value === 'prod'}
      onClick={() => onChange('prod')}
      disabled={disabled}
    >
      {t('Production Environment')}
    </Menu.Item>
  </Menu>
);

RepoSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default RepoSelector;
