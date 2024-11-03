import PropTypes from 'prop-types';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import NavBar from './../NavBar/NavBar';
import ProjectList from './../ProjectList/ProjectList';
import styles from './UserHomePage.module.scss';

class UserHomePage extends React.Component {
  constructor(props) {
    super(props);
    this.onUserLogout = this.onUserLogout.bind(this);
  }
  onUserLogout() {
    console.log("User logout triggered");
  }
  render() {
    return (
      <div className={styles.UserHomePage}>
        <div className={styles.NavigationBarContainer}>
          <NavBar app_title={this.props.app_title} />
        </div>
        <div className={styles.PageWrapper}>
          <Routes>
            <Route path="/" element={<ProjectList />} />

          </Routes>
        </div>
      </div>
    );
  }
}

UserHomePage.propTypes = { app_title: PropTypes.string.isRequired };

UserHomePage.defaultProps = {};

export default UserHomePage;
