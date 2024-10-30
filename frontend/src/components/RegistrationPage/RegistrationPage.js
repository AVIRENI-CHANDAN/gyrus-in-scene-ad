import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './RegistrationPage.module.scss';

class RegistrationPage extends React.Component {
  constructor(props) {
    super(props);
    this.app_title = props.app_title;
  }

  render() {
    return (
      <div className={styles.RegistrationPage}>
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

        <section className={styles.RegistrationSection}>
          <div className={styles.FormContainer}>
            <h2>Register</h2>
            <form className={styles.RegistrationForm}>
              <div className={styles.InputContainer}>
                <label className={styles.Label}>Birthdate:</label>
                <input type="date" required className={styles.Input} />
              </div>
              <div className={styles.InputContainer}>
                <label className={styles.Label}>Email:</label>
                <input type="email" required className={styles.Input} />
              </div>
              <div className={styles.InputContainer}>
                <label className={styles.Label}>Gender:</label>
                <select required className={styles.Input}>
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className={styles.InputContainer}>
                <label className={styles.Label}>Phone Number:</label>
                <input type="text" required className={styles.Input} />
              </div>
              <div className={styles.InputContainer}>
                <label className={styles.Label}>Username:</label>
                <input type="text" required className={styles.Input} />
              </div>
              <div className={styles.InputContainer}>
                <label className={styles.Label}>Password:</label>
                <input type="password" required className={styles.Input} />
              </div>
              <div className={styles.InputContainer}>
                <label className={styles.Label}>Verify:</label>
                <input type="password" required className={styles.Input} />
              </div>
              <button type="submit" className={styles.SubmitButton}>Register</button>
            </form>
          </div>
        </section>
      </div>
    );
  }
}

RegistrationPage.propTypes = { app_title: PropTypes.string.isRequired };
RegistrationPage.defaultProps = {};

export default RegistrationPage;
