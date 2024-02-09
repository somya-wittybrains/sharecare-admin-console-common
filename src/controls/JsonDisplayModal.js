import React, { Component } from 'react';
import { Icon, Modal, Button, Header } from 'semantic-ui-react';
import { isEmpty } from 'lodash';

const debug = require('debug')('controls.JsonDisplayModal');

/**
 * Displays the given entity in a modal as JSON
 */
export default class JsonDisplayModal extends Component {
  constructor (props) {
    debug('constructor(%o)', props);

    super(props);
  }

  render () {
    debug('render()');

    const { header, entity, onClose, ...modalProps } = this.props;

    return (
      <Modal
        basic
        size='small'
        {...modalProps}
        open={!isEmpty(entity)}
        onClose={onClose}
      >
        <Header content={header} />
        <Modal.Content>
          <pre>{JSON.stringify(entity, null, 4)}</pre>
        </Modal.Content>
        <Modal.Actions>
          <Button color='blue' inverted onClick={onClose}>
            <Icon name='close' /> Close
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}
