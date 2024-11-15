import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import help_icon from './../images/icons/help.svg';
import home_icon from './../images/icons/home-icon.svg';
import impt_icon from './../images/icons/import.svg';
import prfl_icon from './../images/icons/profile.svg';
import prjs_icon from './../images/icons/project.svg';
import savd_icon from './../images/icons/saved.svg';
import stng_icon from './../images/icons/settings.svg';
import sgno_icon from './../images/icons/sign-out.svg';
import styles from './NavBar.module.scss';

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: 'User', // Default username
    };
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount() {
    // Fetch user information on component mount
  }

  handleLogout() {
    // Clear tokens or session data
    localStorage.clear();
    // Notify backend to log out
    fetch('/logout', {
      method: 'POST',
      credentials: 'include', // Include cookies
    }).then(() => {
      // Update UI to reflect logout
      if (this.props.onLogout) {
        this.props.onLogout();
      }
    });
  }

  render() {
    return (
      <div className={styles.NavBar}>
        <div className={styles.TitleContainer}>
          <div className={styles.TitleBox}>
            <div className={styles.Title}>
              {this.props.app_title}
            </div>
          </div>
        </div>
        <div className={styles.Actions}>
          <div className={styles.ActionsGroup}>
            <Link to="/home" className={styles.ActionLink}>
              <img src={home_icon} className={styles.ActionBtnIcon} alt='HomeIconErr' />
              <div className={styles.ActionBtnText}>Home</div>
            </Link>
            <Link to="/home/projects" className={styles.ActionLink}>
              <img src={prjs_icon} className={styles.ActionBtnIcon} alt='ProjectsIconErr' />
              <div className={styles.ActionBtnText}>Projects</div>
            </Link>
            <Link to="/home/import" className={styles.ActionLink}>
              <img src={impt_icon} className={styles.ActionBtnIcon} alt='ImportIconErr' />
              <div className={styles.ActionBtnText}>Import</div>
            </Link>
            <Link to="/home/saved" className={styles.ActionLink}>
              <img src={savd_icon} className={styles.ActionBtnIcon} alt='SavedIconErr' />
              <div className={styles.ActionBtnText}>Saved</div>
            </Link>
          </div>
          <div className={styles.ActionsGroup}>
            <Link to="/home/profile" className={styles.ActionLink}>
              <img src={prfl_icon} className={styles.ActionBtnIcon} alt='ProfileIconErr' />
              <div className={styles.ActionBtnText}>My Profile</div>
            </Link>
            <Link to="/home/settings" className={styles.ActionLink}>
              <img src={stng_icon} className={styles.ActionBtnIcon} alt='SettingsIconErr' />
              <div className={styles.ActionBtnText}>Settings</div>
            </Link>
            <button onClick={this.handleLogout} className={styles.ActionLink}>
              <img src={sgno_icon} className={styles.ActionBtnIcon} alt='SignOutIconErr' />
              <div className={styles.ActionBtnText}>Sign Out</div>
            </button>
          </div>
          <div className={styles.ActionsGroup}>
            <Link to="/help" className={styles.ActionLink}>
              <img src={help_icon} className={styles.ActionBtnIcon} alt='HelpIconErr' />
              <div className={styles.ActionBtnText}>Help</div>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

NavBar.propTypes = {
  app_title: PropTypes.string.isRequired,
  onLogout: PropTypes.func, // Callback function for logout action
};

export default NavBar;
