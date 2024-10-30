import React, { lazy, Suspense } from 'react';

const LazyRegistrationPage = lazy(() => import('./RegistrationPage'));

const RegistrationPage = props => (
  <Suspense fallback={null}>
    <LazyRegistrationPage {...props} />
  </Suspense>
);

export default RegistrationPage;
