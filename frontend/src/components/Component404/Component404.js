import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Component404.module.scss';

const Component404 = () => {
  return (
    <div className={styles.Component404}>
      <div className={styles.Component404Container}>
        <h1 className={styles.Component404Title}>404</h1>
        <p className={styles.Component404Message}>Oops! The page you're looking for doesn't exist.</p>
        <Link to="/" className={styles.Component404Link}>
          Go Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Component404;
