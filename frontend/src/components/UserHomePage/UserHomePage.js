import PropTypes from 'prop-types';
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import wave_bg from './../images/background-wave.jpg';
import NavBar from './../NavBar/NavBar';
import NewProject from './../NewProject/NewProject';
import ProjectList from './../ProjectList/ProjectList';
import styles from './UserHomePage.module.scss';

class UserHomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { redirectToLanding: false };
    this.onUserLogout = this.onUserLogout.bind(this);
  }
  onUserLogout() {
    // Clear tokens from localStorage
    localStorage.removeItem('bearer_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');
    // Trigger redirect to landing page
    this.setState({ redirectToLanding: true });
  }
  render() {
    // Redirect to landing page if redirectToLanding is true
    if (this.state.redirectToLanding) {
      return <Navigate to="/" />;
    }
    return (
      <div className={styles.UserHomePage}>
        <div className={styles.NavigationBarContainer}>
          <NavBar app_title={this.props.app_title} onLogout={this.onUserLogout} />
        </div>
        <div className={styles.PageWrapper} style={{ backgroundImage: `url('${wave_bg}')` }}>
          <Routes>
            <Route path="/" element={<ProjectList />} />
            <Route path="/new/project" element={<NewProject />} />
          </Routes>
        </div>
      </div>
    );
  }
}

UserHomePage.propTypes = { app_title: PropTypes.string.isRequired };

UserHomePage.defaultProps = {};

export default UserHomePage;
