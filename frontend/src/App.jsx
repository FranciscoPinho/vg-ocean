import React, { Component } from 'react';
import './App.css';
import RegisterModal from './components/Register/RegisterModal';
import LoginModal from './components/Login/LoginModal';

class App extends Component {


  render() {
    
    return (
      <React.Fragment>
      <LoginModal/>
      <RegisterModal/>
      </React.Fragment>
    );
  }
}

export default App;
