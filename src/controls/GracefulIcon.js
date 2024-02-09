import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';

const IconFallback = props => (
  <svg viewBox='0 0 1 1' {...props}>
    <rect
      x='0'
      y='0'
      width='1'
      height='1'
      fill='transparent'
      stroke='teal'
      strokeWidth='0.06'
    />
  </svg>
);

export default function GracefulIcon ({ path, ...props }) {
  const Icon = lazy(() =>
    import(/* webpackMode: "eager" */ `../modules/${path.replace(
      'modules/',
      ''
    )}`)
  );

  return (
    <Suspense fallback={<IconFallback {...props} />}>
      <Icon {...props} />
    </Suspense>
  );
}

GracefulIcon.propTypes = {
  path: PropTypes.string.isRequired
};
