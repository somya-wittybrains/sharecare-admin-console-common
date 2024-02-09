import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import LoadingSegment from 'controls/LoadingSegment';

function AdminComponent ({ component, ...props }) {
  const Component = lazy(() =>
    import(`../modules/${component.replace('modules/', '')}`)
  );
  const loader = <LoadingSegment />;

  return (
    <Suspense fallback={loader}>
      <Component {...props} />
    </Suspense>
  );
}

export default AdminComponent;

AdminComponent.propTypes = {
  component: PropTypes.string.isRequired
};
