import React, { Component } from 'react';
import { Icon, Modal, Button, Form, Message } from 'semantic-ui-react';

const debug = require('debug')('controls.TextAreaModal');

export default class TextAreaModal extends Component {
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
      onConfirm,
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
          <Form>
            <Form.TextArea
              autoHeight
              placeholder={prompt}
              style={{ minHeight: 100 }}
              onChange={(e, d) => this.setState({ response: d.value })}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color='red' onClick={() => onCancel()}>
            <Icon name='remove' /> {cancelTxt}
          </Button>
          <Button color='green' onClick={() => onConfirm(this.state.response)}>
            <Icon name='checkmark' /> {confirmTxt}
          </Button>
        </Modal.Actions>
      </Modal>
    );

    return modal;
  }
}
