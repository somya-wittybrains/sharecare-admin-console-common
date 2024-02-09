import React from 'react';
import PropTypes from 'prop-types';
import { Message } from 'semantic-ui-react';

// TODO refactor with the getter in MessageList
const getError = rejected => {
  if (rejected && rejected.body && rejected.body.error) {
    return rejected.body.error;
  }
  if (rejected && rejected.body && rejected.body.message) {
    return rejected.body.message;
  }
  if (rejected && rejected.body) {
    return rejected.body;
  }
  return rejected || '';
};

export default function RemoteErrorMessage ({ rejected, onDismiss }) {
  return (
    <Message onDismiss={onDismiss} negative content={getError(rejected)} />
  );
}

RemoteErrorMessage.propTypes = {
  rejected: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
    .isRequired,
  onDismiss: PropTypes.func
};
