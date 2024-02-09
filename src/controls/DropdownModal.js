import React, { Component } from 'react';
import { Icon, Modal, Button, Form } from 'semantic-ui-react';

const debug = require('debug')('controls.DropdownModal');

export default class DropdownModal extends Component {
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
      ...modalProps
    } = this.props;

    const modal = (
      <Modal basic size='small' {...modalProps}>
        <Modal.Header icon={icon}>{title}</Modal.Header>
        <Modal.Content>
          <p>{message}</p>
          <Form>
            <Form.TextArea
              placeholder={prompt}
              onChange={(e, d) => this.setState({ response: d.value })}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color='red' onClick={() => onCancel()}>
            <Icon name='remove' /> No
          </Button>
          <Button color='green' onClick={() => onConfirm(this.state.response)}>
            <Icon name='checkmark' /> Yes
          </Button>
        </Modal.Actions>
      </Modal>
    );

    return modal;
  }
}
