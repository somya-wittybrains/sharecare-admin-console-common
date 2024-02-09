import React from 'react';
import PropTypes from 'prop-types';

export default function Value ({ value, placeholder }) {
  return (
    <div
      style={{
        marginBottom: '1em',
        overflowWrap: 'break-word'
      }}
    >
      {value ? String(value) : placeholder}
    </div>
  );
}

Value.propTypes = {
  value: PropTypes.any,
  placeholder: PropTypes.any
};
