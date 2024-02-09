import React from 'react';
import PropTypes from 'prop-types';
import './Text.less';

const levels = ['primary', 'secondary', 'tertiary'];

export default function Text ({ level, as: Component = 'div', children }) {
  const classList = [levels.includes(level) && level].filter(Boolean);
  return (
    <Component className={`ac text ${classList.join(' ')}`}>
      {children}
    </Component>
  );
}

Text.propTypes = {
  // Allow falsy values for easy rendering with logical operators.
  // Otherwise, ternary condition needs to be used all over the place.
  level: PropTypes.oneOf([...levels, '', false, null, undefined]),
  as: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  children: PropTypes.node
};
