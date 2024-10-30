import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LoginPage.module.scss';

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.app_title = props.app_title;
  }
  render() {
    return (
      <div className={styles.LoginPage}>
        <header className={styles.Header}>
          <nav className={styles.Navbar}>
            <div className={styles.Logo}>{this.app_title}</div>
            <ul className={styles.NavLinks}>
              <li>
                <button onClick={() => this.scrollToSection(this.featuresRef)} className={styles.NavLink}>
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => this.scrollToSection(this.howItWorksRef)} className={styles.NavLink}>
                  How It Works
                </button>
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
              <form>
                <div className={styles.InputContainer}>
                  <label className={styles.Label}>Email:</label>
                  <input type="email" className={styles.Input} />
                </div>
                <div className={styles.InputContainer}>
                  <label className={styles.Label}>Password:</label>
                  <input type="password" className={styles.Input} />
                </div>
                <button className={styles.SubmitButton}>Login</button>
              </form>
            </div>
          </div>
        </section>
      </div>
    );
  }
};

LoginPage.propTypes = {};

LoginPage.defaultProps = {};

export default LoginPage;
