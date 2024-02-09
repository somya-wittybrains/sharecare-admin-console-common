import React from 'react';
import { Segment, Image } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { ReactComponent as SharecareLogo } from './sharecare-logo.svg';

export default function LoadingSegment ({
  loading = true,
  children,
  padded,
  ...props
}) {
  return (
    <Segment
      loading={loading}
      textAlign={loading ? 'center' : undefined}
      {...props}
      padded={padded === 'none' ? undefined : padded}
      style={{
        marginTop: 0,
        // large image height + some spacing
        minHeight: children && loading ? 432 : undefined,
        padding: padded === 'none' ? 0 : undefined
      }}
    >
      {loading ? (
        <Image
          size='large'
          as={SharecareLogo}
          verticalAlign='middle'
          style={{
            position: children ? 'absolute' : undefined,
            top: children ? '50%' : undefined,
            transform: children ? 'translate(-50%, -50%)' : undefined,
            zIndex: 99
          }}
        />
      ) : (
        children
      )}
    </Segment>
  );
}

LoadingSegment.propTypes = {
  loading: PropTypes.bool,
  children: PropTypes.element,
  padded: PropTypes.oneOf(['very', 'none'])
};
