import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage/LandingPage';
import LoginPage from './components/LoginPage/LoginPage';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.app_title = "Gyrus";
  }

  render() {
    return (
      <Routes>
        <Route path="/" element={<LandingPage app_title={this.app_title} />} />
        <Route path="/login" element={<LoginPage app_title={this.app_title} />} />
      </Routes>
    );
  }
}

export default App;
