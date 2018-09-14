import React, { Component } from "react";
import {
    Icon,
    Image,
    Dropdown
} from "semantic-ui-react";
import LoginModal from '../Login/LoginModal';
import RegisterModal from '../Register/RegisterModal';
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";


import './Header.css'



class Heading extends Component {
    render() {
        return (
            <div className="nav">
                <div className="nav-header">
                    <div className="nav-title">
                        <Link to="/"> 
                            <Image src={logo} centered/>
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
                    <Link to="/feedback">My Collection</Link>
                    <Link to="/feedback">Explore</Link>
                    <Link to="/add+"> Add+</Link>
                    <Dropdown item text="Create">
                        <Dropdown.Menu>
                            <Dropdown.Item>List</Dropdown.Item>
                            <Dropdown.Item>Article</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Link to="/add+1"> Premium</Link>
                    <Link to="/feedback">Feedback</Link>
                </div>
                <div className="nav-log-modal">
                    <LoginModal/>
                </div>
                <RegisterModal/>
            </div>
        )
    }
} export default Heading