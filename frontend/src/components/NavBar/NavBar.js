import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
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
    fetch('/user-info', {
      method: 'POST',
      credentials: 'include', // This will include cookies in the request
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: ['email']
      })
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Unable to fetch user info');
      })
      .then((data) => {
        if (data.email) {
          this.setState({ username: data.email });
        }
      })
      .catch((error) => {
        console.error('Error fetching user info:', error);
      });
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
          <div className={styles.Greeting}>
            Hello, {this.state.username}
          </div>
        </div>
        <div className={styles.Actions}>
          <Link to="/home" className={styles.ActionLink}>Home</Link>
          <button onClick={this.handleLogout} className={styles.ActionLink}>Logout</button>
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
