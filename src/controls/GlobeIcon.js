import React from 'react';
import { ReactComponent as Icon } from './globe-icon.svg';
import PropTypes from 'prop-types';

const GlobeIcon = ({ color = '#09C199', height, width, ...props }) => (
  <span {...props}>
    <Icon fill={color} height={height} width={width} />
  </span>
);

GlobeIcon.propTypes = {
  color: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
export default GlobeIcon;
