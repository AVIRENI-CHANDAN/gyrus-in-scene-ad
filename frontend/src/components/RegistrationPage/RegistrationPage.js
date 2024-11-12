import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './RegistrationPage.module.scss';
import wave_bg from './../images/background-wave.jpg';

class RegistrationPage extends React.Component {
  constructor(props) {
    super(props);
    this.app_title = props.app_title;
    this.state = {
      birthdate: '',
      email: '',
      gender: '',
      phoneNumber: '',
      username: '',
      password: '',
      verifyPassword: '',
      errorMessage: '',
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const {
      birthdate, email, gender, phoneNumber, username, password, verifyPassword
    } = this.state;

    if (password !== verifyPassword) {
      this.setState({ errorMessage: 'Passwords do not match.' });
      return;
    }

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ birthdate, email, gender, phoneNumber, username, password }),
      });

      if (!response.ok) {
        throw new Error('Failed to register user');
      }

      // Handle success (e.g., navigate to login or display success message)
      this.setState({ errorMessage: 'User registered successfully!' });
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }
  };

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

        <section className={styles.RegistrationSection} style={{ backgroundImage: `url(${wave_bg})` }}>
          <div className={styles.FormContainer}>
            <h2>Register</h2>
            <form className={styles.RegistrationForm} onSubmit={this.handleSubmit}>
              <div className={styles.InputContainer}>
                <label className={styles.Label}>Birthdate:</label>
                <input
                  type="date"
                  name="birthdate"
                  value={this.state.birthdate}
                  onChange={this.handleChange}
                  required
                  className={styles.Input}
                />
              </div>
              <div className={styles.InputContainer}>
                <label className={styles.Label}>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={this.state.email}
                  onChange={this.handleChange}
                  required
                  className={styles.Input}
                />
              </div>
              <div className={styles.InputContainer}>
                <label className={styles.Label}>Gender:</label>
                <select
                  name="gender"
                  value={this.state.gender}
                  onChange={this.handleChange}
                  required
                  className={styles.Input}
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className={styles.InputContainer}>
                <label className={styles.Label}>Phone Number:</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={this.state.phoneNumber}
                  onChange={this.handleChange}
                  required
                  className={styles.Input}
                />
              </div>
              <div className={styles.InputContainer}>
                <label className={styles.Label}>Username:</label>
                <input
                  type="text"
                  name="username"
                  value={this.state.username}
                  onChange={this.handleChange}
                  required
                  className={styles.Input}
                />
              </div>
              <div className={styles.InputContainer}>
                <label className={styles.Label}>Password:</label>
                <input
                  type="password"
                  name="password"
                  value={this.state.password}
                  onChange={this.handleChange}
                  required
                  className={styles.Input}
                />
              </div>
              <div className={styles.InputContainer}>
                <label className={styles.Label}>Verify:</label>
                <input
                  type="password"
                  name="verifyPassword"
                  value={this.state.verifyPassword}
                  onChange={this.handleChange}
                  required
                  className={styles.Input}
                />
              </div>
              {this.state.errorMessage && (
                <div className={styles.ErrorMessage}>{this.state.errorMessage}</div>
              )}
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
