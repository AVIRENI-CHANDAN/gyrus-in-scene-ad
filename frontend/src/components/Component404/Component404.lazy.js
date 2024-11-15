import React, { lazy, Suspense } from 'react';

const LazyComponent404 = lazy(() => import('./Component404'));

const Component404 = props => (
  <Suspense fallback={null}>
    <LazyComponent404 {...props} />
  </Suspense>
);

export default Component404;
