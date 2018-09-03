import React, { Component } from "react";
import {
    Container,
    Icon,
    Image,
    Menu,
    Sidebar,
    Responsive,
    Dropdown
} from "semantic-ui-react";
import LoginModal from '../Login/LoginModal';
import RegisterModal from '../Register/RegisterModal';
import { Link } from "react-router-dom";


import './Header.css'



class Heading extends Component {
    render() {
        return (
            <div className="nav">
                <div className="nav-header">
                    <div className="nav-title">
                        <Link to="/"> 
                            <Image size='mini' src="https://react.semantic-ui.com/logo.png"/>
                        </Link> 
                    </div>
                </div>
                <div className="nav-btn">
                    <label htmlFor="nav-check">
                        <Icon className="hamburgericon" inverted name='bars' size='large'/>
                    </label>
                </div>
                <input type="checkbox" id="nav-check"/>
                <div className="nav-links">
                
                    <a >My Collection</a>
                    <a >Explore</a>
                    <Link to="/add+"> Add+</Link>
                    <Dropdown item text="Create">
                        <Dropdown.Menu inverted>
                            <Dropdown.Item>List</Dropdown.Item>
                            <Dropdown.Item>Article</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <a href="https://codepen.io/jo_Geek/" target="_blank">Premium</a>
                    <a href="https://jsfiddle.net/user/jo_Geek/" target="_blank">Feedback</a>
                </div>
                <div className="nav-log-modal">
                    <LoginModal/>
                </div>
                <RegisterModal/>
            </div>
        )
    }
} export default Heading