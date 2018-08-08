import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import LoginForm from './components/Login/LoginForm.jsx';
import RegisterForm from './components/Register/RegisterForm.jsx';

class App extends Component {
  render() {
    return (
      //<LoginForm />
      <RegisterForm />
    );
  }
}

export default App;
