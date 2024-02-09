import React from 'react';
import { ReactComponent as Icon } from './sharecare-logo.svg';
import { ReactComponent as WhiteIcon } from './sharecare-logo-white.svg';
import PropTypes from 'prop-types';

const SharecareIcon = ({ color, height, width, ...props }) => {
	const isWhiteColor = color && (color.toUpperCase() === '#FFFFFF' || color.toUpperCase() === '#FFF');
	return (
	  <span {...props}>
	    {isWhiteColor && (<WhiteIcon fill={color} height={height} width={width} />)}
	    {!isWhiteColor && (<Icon fill={color} height={height} width={width} />)}
	  </span>
	);	
}

SharecareIcon.propTypes = {
  color: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
export default SharecareIcon;
