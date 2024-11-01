import PropTypes from 'prop-types';
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import styles from './LoginPage.module.scss';

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.app_title = props.app_title;
    this.state = {
      username: '',
      password: '',
      redirectToHome: false
    };
    this.login_end_point = "/login";
    this.handleInputChange = this.handleInputChange.bind(this);
    this.loginUser = this.loginUser.bind(this);
  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  loginUser(event) {
    event.preventDefault();
    fetch(this.login_end_point, {
      signal: AbortSignal.timeout(5000),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      })
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(data => {
        this.saveTokens(data);
        this.setState({ redirectToHome: true });  // Set redirect to true after login
      })
      .catch(error => {
        console.error("Login error:", error);
      });
  }

  isValidToken() {

  }

  saveTokens(data) {
    const { AccessToken: bearer_token, ExpiresIn: expires_in, TokenType: token_type, RefreshToken: refresh_token, IdToken: id_token } = data;
    localStorage.setItem('bearer_token', bearer_token);
    localStorage.setItem('token_type', token_type);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('id_token', id_token);
  }

  render() {
    // Redirect to /home if redirectToHome is true
    if (this.state.redirectToHome) {
      return <Navigate to="/home" />;
    }

    return (
      <div className={styles.LoginPage}>
        <header className={styles.Header}>
          <nav className={styles.Navbar}>
            <div className={styles.Logo}>{this.app_title}</div>
            <ul className={styles.NavLinks}>
              <li>
                <Link to="/" className={styles.NavLink}>Home</Link>
              </li>
              <li>
                <Link to="/login" className={styles.NavLink}>Login</Link>
              </li>
              <li>
                <Link to="/register" className={styles.NavLink}>Register</Link>
              </li>
            </ul>
          </nav>
        </header>
        <section className={styles.LoginSection}>
          <div className={styles.LoginContainer}>
            <div className={styles.LoginForm}>
              <h2>Login</h2>
              <form onSubmit={this.loginUser}>
                <div className={styles.InputContainer}>
                  <label className={styles.Label}>Username:</label>
                  <input type="text" name="username" className={styles.Input} value={this.state.username} onChange={this.handleInputChange} />
                </div>
                <div className={styles.InputContainer}>
                  <label className={styles.Label}>Password:</label>
                  <input type="password" name="password" className={styles.Input} value={this.state.password} onChange={this.handleInputChange} />
                </div>
                <button className={styles.SubmitButton}>Login</button>
              </form>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

LoginPage.propTypes = { app_title: PropTypes.string.isRequired };

export default LoginPage;
