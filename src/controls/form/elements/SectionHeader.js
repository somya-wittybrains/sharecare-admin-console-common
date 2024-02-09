import React from 'react';
import PropTypes from 'prop-types';
import { Header, Icon, Modal } from 'semantic-ui-react';

export default function SectionHeader ({
  text,
  infoContent,
  icon = 'info circle'
}) {
  return (
    <Header size='large'>
      <Header.Content>{text}</Header.Content>
      {infoContent && (
        <Header.Content
          style={{ fontSize: 16, verticalAlign: 'baseline', marginLeft: '1em' }}
        >
          {
            <Modal trigger={<Icon name={icon} link />} closeIcon>
              {infoContent}
            </Modal>
          }
        </Header.Content>
      )}
    </Header>
  );
}

SectionHeader.propTypes = {
  text: PropTypes.string.isRequired,
  infoContent: PropTypes.element,
  icon: PropTypes.string
};
