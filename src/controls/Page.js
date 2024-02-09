import React, { Component } from 'react';
import { observer } from 'mobx-react-lite';
import { Menu, Container } from 'semantic-ui-react';

const debug = require('debug')('components.Page');

export default
@observer
class Page extends Component {
  constructor (props) {
    debug('constructor(%o)', props);

    super(props);
  }
  render () {
    debug('render()');

    const { header, menu = [], children = [], ...menuProps } = this.props;

    return (
      <Container>
        <Menu secondary {...menuProps}>
          <Menu.Item header as='h1'>
            {header}
          </Menu.Item>
          {menu}
        </Menu>
        {children}
      </Container>
    );
  }
}
