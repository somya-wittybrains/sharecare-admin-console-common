import React, { Component } from 'react';
import { Icon, Modal, Button, Message } from 'semantic-ui-react';

const debug = require('debug')('controls.FormModal');

export default class FormModal extends Component {
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
      prompt,
      onConfirm = () => {},
      onCancel,
      error = '',
      cancelTxt = 'No',
      confirmTxt = 'Yes',
      ...modalProps
    } = this.props;

    const modal = (
      <Modal basic size='small' {...modalProps}>
        <Modal.Header icon={icon}>{title}</Modal.Header>
        <Modal.Content>
          <p>{message}</p>
          {error && (
            <Message size='tiny' error compact>
              {error}
            </Message>
          )}
          {this.props.children}
        </Modal.Content>
        <Modal.Actions>
          {onCancel && (
            <Button color='red' onClick={() => onCancel()}>
              <Icon name='remove' /> {cancelTxt}
            </Button>
          )}
          <Button color='green' onClick={() => onConfirm()}>
            <Icon name='checkmark' /> {confirmTxt}
          </Button>
        </Modal.Actions>
      </Modal>
    );

    return modal;
  }
}
