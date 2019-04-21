import React, { Component } from "react";
import {
    Icon,
    Image,
    Dropdown,
    Accordion
} from "semantic-ui-react";
import LoginModal from '../Login/LoginModal';
import RegisterModal from '../Register/RegisterModal';
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";


import './Header.css'



class Heading extends Component {
    state = { activeIndex: -1 }

    handleClick = (e, titleProps) => {
        const { index } = titleProps
        const { activeIndex } = this.state
        const newIndex = activeIndex === index ? -1 : index

        this.setState({ activeIndex: newIndex })
    }
    render() {
        const { activeIndex } = this.state
        return (
            <div className="nav">
                <div className="nav-header">
                    <div className="nav-title">
                        <Link to="/">
                            <Image src={logo} centered />
                        </Link>
                    </div>
                </div>
                <div className="nav-btn">
                    <label htmlFor="nav-check">
                        <Icon className="hamburgericon" inverted name='bars' size='large' />
                    </label>
                </div>
                <input type="checkbox" id="nav-check" />
                <div className="nav-links">
                    <Link to="/feedback">My Collection</Link>
                    <Link to="/feedback">Explore</Link>
                    <Link to="/add+"> Add+</Link>
                    <Dropdown className="create-dropdown" item text="Create">
                        <Dropdown.Menu>
                            <Dropdown.Item id="header-dropdown-item"><Link to="/feedback">List</Link></Dropdown.Item>
                            <Dropdown.Item id="header-dropdown-item"><Link to="/feedback">Article</Link></Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Accordion className="create-accordion" fluid>
                        <Accordion.Title active={activeIndex === 0} index={0} onClick={this.handleClick}>
                            <Icon name='dropdown' />
                            Create
                        </Accordion.Title>
                        <Accordion.Content active={activeIndex === 0}>
                            <Link to="/feedback">List</Link>
                            <Link to="/feedback">Article</Link>
                        </Accordion.Content>
                    </Accordion>
                    <Link to="/add+1"> Premium</Link>
                    <Link to="/feedback">Feedback</Link>
                    <Link to="/credits">Credits</Link>
                </div>
                <div className="nav-log-modal">
                    <LoginModal />
                </div>
                <RegisterModal />
            </div>
        )
    }
} export default Heading

//in credits must include “Sound effects obtained from https://www.zapsplat.com“