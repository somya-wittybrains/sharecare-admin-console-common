import React from 'react';
import PropTypes from 'prop-types';
import GracefulIcon from './GracefulIcon';
import { Header, Image, Segment } from 'semantic-ui-react';
import './AdminComponentSidebar.less';

function AdminComponentSidebar({
  iconComponent,
  title,
  description,
  children
}) {
  // Dear moin.shifu@wittybrains.com,
  // can we please stop resetting this change over and over again?
  // It has been agreed that the initial design does not work for long modules names
  // and will be a problem for sure when introducing different languages.
  // Certainly, titles in Portuguese, French or German will longer than their English versions.
  //
  // One more point: there is an agreement that the designs should be based on Semantic UI.
  // However, they deviate from Semantic UI significantly. As a result, we try to get as
  // close as possible, but the first priotiy is to use raw Semantic UI component for easier maintenance.
  // For proper customization of the UI, please read and follow: https://react.semantic-ui.com/theming
  // There are cues about customizing lesscss stuff in config-overrides.js (at the root of the ui folder).
  //
  // Your efforts at styling the project are appreciated, but the way they are carried is suboptimal.
  // Specifically, you should consult before resetting changes that were intentionally made.
  // Thank you for your understanding.
  return (
    <>
      <Segment
        padded
        basic
        className='sidebar-header'
        style={{ textAlign: 'center' }}
      >
        <Header as='h1' icon>
          <Image as={GracefulIcon} path={iconComponent} centered />
          <Header.Content>{title}</Header.Content>
        </Header>
        <Header.Subheader>{description}</Header.Subheader>
      </Segment>
      <Segment basic className='sidebar-content'>
        {children}
      </Segment>
    </>
  );
}

export default AdminComponentSidebar;

AdminComponentSidebar.propTypes = {
  iconComponent: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.element
};
