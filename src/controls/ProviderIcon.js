import React from 'react';
import { ReactComponent as Icon } from './provider-icon.svg';
import { ReactComponent as WhiteIcon } from './provider-icon-white-fill.svg';
import PropTypes from 'prop-types';

const ProviderIcon = ({ color, height, width, ...props }) => {
  const isWhiteColor =
    color &&
    (color.toUpperCase() === '#FFFFFF' || color.toUpperCase() === '#FFF');
  return (
    <span {...props}>
      {isWhiteColor && (
        <WhiteIcon
          fill={color}
          height={height ? height : 20}
          width={width ? width : 20}
        />
      )}
      {!isWhiteColor && (
        <Icon
          fill={color}
          height={height ? height : 20}
          width={width ? width : 20}
        />
      )}
    </span>
  );
};

ProviderIcon.propTypes = {
  color: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
export default ProviderIcon;
