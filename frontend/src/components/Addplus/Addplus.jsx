import React, { Component } from "react"
import Heading from '../Header/Header'
import Beaten from '../../icons/beaten.png'
import Unfinished from '../../icons/unfinished.png'
import Completed from '../../icons/completed.png'
import Thumbnail from '../../assets/cover_thumb.png'
import {Grid,Table,Menu,Segment,Image,Radio} from 'semantic-ui-react'
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
        for(let k in consolelist){
            console.log(k)
            menu.push(<Menu.Header><h3 className="sidebar-header">{k}</h3></Menu.Header>)
            for(let c in consolelist[k]){
                menu.push(<Menu.Item className="sidebar-item" name={consolelist[k][c]} active={this.state.activeItem === consolelist[k][c]} onClick={this.handleItemClick}></Menu.Item>)
            }
        }
        return menu
    }
    handleItemClick = (e, { name }) => this.setState({ activeItem: name })
    render() {
        return (
        <React.Fragment>
            <Heading/>
            <Grid columns={3} stackable style={{padding:"0",margin:"0"}}>
                <Grid.Column width={3} style={{padding:"0"}} only="computer large screen">
                <Menu pointing secondary vertical className="full-height sidebar-ocean">
                    {this.createMenuItems(this.consoles)}
                </Menu>
                </Grid.Column>
            
                <Grid.Column width={10} style={{overflowX:"scroll"}}>
                <Segment raised className="table-icons-cell segment-table">
                            Mark selections as:
                                    <Image src={Completed}></Image>
                                    <Image src={Beaten}></Image>
                                    <Image src={Unfinished}></Image>
                </Segment>     
                <Table celled attached unstackable id="table-games" >
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
                            <Table.Cell style={{display:"inline-flex",verticalAlign:"middle"}}><Radio></Radio><Image src={Thumbnail}></Image></Table.Cell>
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
                            <Table.Cell></Table.Cell>
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