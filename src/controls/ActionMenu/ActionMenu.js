import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Placeholder, Segment } from 'semantic-ui-react';
import Item from './ActionMenuItem';
import './ActionMenu.less';

export default function ActionMenu ({ children, loading, ...props }) {
  if (React.Children.toArray(children).length === 0) return null;
  else
    return loading ? (
      <Segment className='ac action-menu'>
        <Placeholder>
          <Menu.Item>
            <Placeholder.Paragraph>
              <Placeholder.Line length='full' />
              <Placeholder.Line length='full' />
              <Placeholder.Line length='full' />
              <Placeholder.Line length='full' />
            </Placeholder.Paragraph>
          </Menu.Item>
        </Placeholder>
      </Segment>
    ) : (
      <Menu {...props} vertical className='ac action-menu'>
        {children}
      </Menu>
    );
}

ActionMenu.Item = Item;

ActionMenu.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(Item),
    PropTypes.objectOf(Item)
  ]),
  loading: PropTypes.bool
};
