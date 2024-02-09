import React, { Component } from 'react';
import { Icon, Modal, Button, Header } from 'semantic-ui-react';

const debug = require('debug')('controls.ConfirmationModal');

export default class ConfirmationModal extends Component {
  constructor (props) {
    debug('constructor(%o)', props);

    super(props);
  }

  render () {
    debug('render()');

    const {
      icon,
      title,
      message,
      content,
      prompt,
      onConfirm,
      confirmColor = 'green',
      showCancelButton = false,
      onClose = () => {},
      ...modalProps
    } = this.props;

    const modal = (
      <Modal basic size='small' onClose={onClose} {...modalProps}>
        <Header icon={icon} content={title} />
        {content ? (
          <Modal.Content>{content}</Modal.Content>
        ) : (
          <Modal.Content>
            <h3>{message}</h3>
          </Modal.Content>
        )}
        <Modal.Actions>
          {showCancelButton && (
            <Button color='blue' inverted onClick={onClose}>
              <Icon name='close' /> Cancel
            </Button>
          )}
          <Button color={confirmColor} onClick={() => onConfirm()} inverted>
            <Icon name='checkmark' /> {prompt}
          </Button>
        </Modal.Actions>
      </Modal>
    );

    return modal;
  }
}
