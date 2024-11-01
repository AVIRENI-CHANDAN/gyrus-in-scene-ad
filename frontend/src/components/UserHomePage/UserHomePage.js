import PropTypes from 'prop-types';
import React from 'react';
import styles from './UserHomePage.module.scss';

class UserHomePage extends React.Component {
  render() {
    return (
      <div className={styles.UserHomePage}>
        UserHomePage Component
      </div>
    );
  }
}

UserHomePage.propTypes = { app_title: PropTypes.string.isRequired };

UserHomePage.defaultProps = {};

export default UserHomePage;
