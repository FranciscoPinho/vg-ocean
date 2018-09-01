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
import LoginModal from '../components/Login/LoginModal';
import RegisterModal from '../components/Register/RegisterModal';

import './Header.css'



class Heading extends Component {
    render() {
        return (
            <div className="nav">
                <div className="nav-header">
                    <div className="nav-title">
                        <Image
                            as='a'
                            size='mini'
                            href='http://google.com'
                            target='_blank'
                            src="https://react.semantic-ui.com/logo.png"
                        />
                    </div>
                </div>
                <div className="nav-btn">
                    <label htmlFor="nav-check">
                        <Icon className="hamburgericon" inverted name='bars' size='large'/>
                    </label>
                </div>
                <input type="checkbox" id="nav-check"/>
                <div className="nav-links">
                    <a href="//github.io/jo_geek" target="_blank">My Collection</a>
                    <a href="http://stackoverflow.com/users/4084003/" target="_blank">Explore</a>
                    <a href="https://in.linkedin.com/in/jonesvinothjoseph" target="_blank">Add+</a>
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