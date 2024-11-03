import React, { lazy, Suspense } from 'react';

const LazyNewProject = lazy(() => import('./NewProject'));

const NewProject = props => (
  <Suspense fallback={null}>
    <LazyNewProject {...props} />
  </Suspense>
);

export default NewProject;
