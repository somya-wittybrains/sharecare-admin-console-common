import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Message } from 'semantic-ui-react';

// Used to show ephemeral message coming from a redirect
export default function RouteMessage ({
  state: { message, messageNegative = false } = {}
}) {
  const [confirmationMessage, updateConfirmationMessage] = useState(message);

  return (
    <Message
      positive={!messageNegative}
      negative={messageNegative}
      hidden={!confirmationMessage}
      content={confirmationMessage}
      onDismiss={() => updateConfirmationMessage(null)}
    />
  );
}

RouteMessage.propTypes = {
  state: PropTypes.shape({
    message: PropTypes.string.isRequired,
    messageNegative: PropTypes.bool
  })
};
