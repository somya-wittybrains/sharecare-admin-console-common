import React from 'react';
import PropTypes from 'prop-types';

// FIXME do not use dangerouslySetInnerHTML
export default function HtmlValue ({ value, placeholder }) {
  return (
    <div
      style={{
        marginBottom: '1em'
      }}
      dangerouslySetInnerHTML={{ __html: value || placeholder }}
    />
  );
}

HtmlValue.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.any
};
