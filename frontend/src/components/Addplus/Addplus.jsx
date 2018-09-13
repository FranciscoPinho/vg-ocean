import React, { Component } from "react"
import Heading from '../Header/Header'
import Beaten from '../../icons/beaten.png'
import Unfinished from '../../icons/unfinished.png'
import Completed from '../../icons/completed.png'
import {Grid,Icon,Table,Menu,Segment,Image,Sidebar, Container,Divider} from 'semantic-ui-react'
import './Addplus.css'

class Addplus extends Component {
    state = { activeItem: 'NES' }
    consoles = {
        'Nintendo':['NES',
        'Super Nintendo',
        'Game Boy'],
        'Sega':[ 'Master System',
        'Genesis/Mega Drive',
        'Sega Saturn']
    }
    createMenuItems = (consolelist) => {
        let menu = []
       // for(k,v in consolelist){
       //     menu.push(<Menu.Header><h3 className="sidebar-header">{k}</h3></Menu.Header>)
       // }
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })
    render() {
        return (
        <React.Fragment>
            <Heading/>
            <Grid columns={3} stackable style={{padding:"0",margin:"0"}}>
                <Grid.Column width={3} style={{padding:"0"}} only="computer large screen">
                <Menu pointing secondary vertical className="full-height sidebar-ocean">

                        <Menu.Header>
                            <h3 className="sidebar-header">Nintendo</h3>
                        </Menu.Header>
                        <Menu.Item className="sidebar-item" name='NES' active={this.state.activeItem === 'NES'} onClick={this.handleItemClick}>
                        </Menu.Item>
                        <Menu.Item className="sidebar-item" name='Super Nintendo' active={this.state.activeItem === 'Super Nintendo'} onClick={this.handleItemClick}>
                        </Menu.Item>
                        <Menu.Item className="sidebar-item" name='Game Boy' active={this.state.activeItem === 'Game Boy'} onClick={this.handleItemClick}>
                        </Menu.Item>
                        <Menu.Header>
                            <h3 className="sidebar-header">Sega</h3>
                        </Menu.Header>
                        <Menu.Item className="sidebar-item" name='Master System' active={this.state.activeItem === 'Master System'} onClick={this.handleItemClick}>
                        </Menu.Item>
                        <Menu.Item className="sidebar-item" name='Genesis/Mega Drive' active={this.state.activeItem === 'Genesis/Mega Drive'} onClick={this.handleItemClick}>
                        </Menu.Item>
                        <Menu.Item className="sidebar-item" name='Sega Saturn' active={this.state.activeItem === 'Sega Saturn'} onClick={this.handleItemClick}>
                        </Menu.Item>
                </Menu>
                </Grid.Column>
            
                <Grid.Column width={10} style={{overflowX:"scroll"}}>
                <Segment raised className="table-icons-cell segment-table">
                            Mark selections as:
                                    <Image src={Completed}></Image>
                                    <Image src={Beaten}></Image>
                                    <Image src={Unfinished}></Image>
                </Segment>     
                <Table celled selectable attached unstackable id="table-games" >
                    <Table.Header >
                    <Table.Row>
                        <Table.HeaderCell className="table-games-header">Add</Table.HeaderCell>
                        <Table.HeaderCell className="table-games-header">Title</Table.HeaderCell>
                        <Table.HeaderCell className="table-games-header">Type</Table.HeaderCell>
                        <Table.HeaderCell className="table-games-header">Playtime</Table.HeaderCell>
                        <Table.HeaderCell className="table-games-header">Rating</Table.HeaderCell>
                    </Table.Row>
                    </Table.Header>
                    <Table.Body>
                    
                    <Table.Row>
                        <Table.Cell>Super Mario Bros 1</Table.Cell>
                        <Table.Cell className="table-icons-cell">
                            <Image src={Completed}></Image>
                            <Image src={Beaten}></Image>
                            <Image src={Unfinished}></Image>
                            <Image src={Completed}></Image>
                            <Image src={Beaten}></Image>
                            <Image src={Unfinished}></Image>
                        </Table.Cell>
                        <Table.Cell>None</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Super Mario Bros 2</Table.Cell>
                        <Table.Cell className="table-icons-cell">
                            <Image src={Completed}></Image>
                            <Image src={Beaten}></Image>
                            <Image src={Unfinished}></Image>
                            <Image src={Completed}></Image>
                            <Image src={Beaten}></Image>
                            <Image src={Unfinished}></Image>
                        </Table.Cell>
                        <Table.Cell>Requires call</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Super Mario Bros 3</Table.Cell>
                        <Table.Cell className="table-icons-cell">
                            <Image src={Completed}></Image>
                            <Image src={Beaten}></Image>
                            <Image src={Unfinished}></Image>
                            <Image src={Completed}></Image>
                            <Image src={Beaten}></Image>
                            <Image src={Unfinished}></Image>
                        </Table.Cell>
                        <Table.Cell>None</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Super Mario Bros 4</Table.Cell>
                        <Table.Cell className="table-icons-cell">
                            <Image src={Completed}></Image>
                            <Image src={Beaten}></Image>
                            <Image src={Unfinished}></Image>
                            <Image src={Completed}></Image>
                            <Image src={Beaten}></Image>
                            <Image src={Unfinished}></Image>
                        </Table.Cell>
                        <Table.Cell>None</Table.Cell>
                    </Table.Row>
                    </Table.Body>
                </Table>
            </Grid.Column>
            <Grid.Column  width={3}>
            <Segment.Group style={{borderRadius:"0px",border:"0"}}>
                <Segment raised style={{borderRadius:"0px",background:"transparent",color:"white"}}>Additions:</Segment>
                <Segment>Middle</Segment>
                <Segment>Right</Segment>
            </Segment.Group>
            </Grid.Column>
            </Grid>
        </React.Fragment>
        )
            
    }
} export default Addplus

/*
  
*/