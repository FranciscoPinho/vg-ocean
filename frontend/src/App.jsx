import React, { Component } from 'react';
import './App.css';
import RegisterModal from './components/Register/RegisterModal';
import LoginModal from './components/Login/LoginModal';
import Heading from './components/Header';

class App extends Component {


  render() {
    
    return (
      <React.Fragment>
      <Heading/>
      {/* <RegisterModal/> */}
      </React.Fragment>
    );
  }
}

export default App;
