import React, { lazy, Suspense } from 'react';

const LazyUserHomePage = lazy(() => import('./UserHomePage'));

const UserHomePage = props => (
  <Suspense fallback={null}>
    <LazyUserHomePage {...props} />
  </Suspense>
);

export default UserHomePage;
