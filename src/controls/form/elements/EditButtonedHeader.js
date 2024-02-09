import React from 'react';
import PropTypes from 'prop-types';
import { Header } from 'semantic-ui-react';
import ActionIcon from 'controls/ActionIcon';

export default function EditButtonedHeader ({
  as = 'h2',
  headerText,
  buttonText,
  canEdit = false,
  onClick,
  ...props
}) {
  const handleClick = () => {
    onClick();
  };

  return (
    <Header
      as={as}
      textAlign='right'
      style={{ display: 'inline-block', width: '100%' }}
    >
      <span style={{ float: 'left' }}>{headerText} </span>
      {canEdit && (
        <ActionIcon
          name='pencil'
          content={buttonText}
          floated='right'
          width='5px'
          onClick={handleClick}
        />
      )}
    </Header>
  );
}

EditButtonedHeader.propTypes = {
  as: PropTypes.string,
  headerText: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  canEdit: PropTypes.bool,
  onClick: PropTypes.func.isRequired
};
