import React from 'react';
import PropTypes from 'prop-types';
import './ClickLink.less';

export default function ClickLink ({ onClick, label, disabled, ...props }) {
  const wrappedLabel = typeof label === 'string' ? <span>{label}</span> : label;

  return (
    <button
      disabled={disabled}
      className='ac click-link'
      onClick={disabled ? undefined : onClick}
      {...props}
    >
      {wrappedLabel}
    </button>
  );
}

ClickLink.propTypes = {
  label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};
