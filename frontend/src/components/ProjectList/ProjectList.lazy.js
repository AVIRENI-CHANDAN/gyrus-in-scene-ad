import React, { lazy, Suspense } from 'react';

const LazyProjectList = lazy(() => import('./ProjectList'));

const ProjectList = props => (
  <Suspense fallback={null}>
    <LazyProjectList {...props} />
  </Suspense>
);

export default ProjectList;
