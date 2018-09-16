import React, { Component } from "react"
import Heading from '../Header/Header'
import Beaten from '../../icons/beaten.png'
import Unfinished from '../../icons/unfinished.png'
import Completed from '../../icons/completed.png'
import {Grid,Table,Menu,Segment,Image,Icon,Container,Search,Loader,Dimmer,Pagination} from 'semantic-ui-react'
import {debounce} from 'throttle-debounce'
import axios from 'axios'
import './Addplus.css'
import { server_url } from "../..";


class Addplus extends Component {
    state = {
        tableGames:[],
        addedGames:[],
        isLoading:false,
        isTableLoading:false,
        activeConsole:null,
        searchQuery:"",
        totalPages:0,
        lowerLimit:0,
        upperLimit:30,
        activePage:1,
        scheduledFetch:()=>{}
    }

    consoles = {
        'Nintendo':[{id:1,name:'Nintendo Entertainment System',dim:'55x80'},
        {id:4,name:'Super Nintendo',dim:'80x55'}],
        'Sega':[{id:3,name:'Master System',dim:'55x80'},
        {id:2,name:'Genesis/Mega Drive',dim:'55x80'}]
    }

    componentWillMount(){
        document.title="VGOcean - Add+"
    }

    processImageURL = (game) => {
        if(game.cover_platform_uri)
            return game.cover_platform_uri.replace("cover","cover_thumb")
        return ""
    }
    
    addGame = (newgame) => {
        this.setState({
            addedGames:[...this.state.addedGames,newgame]
        })
    }

    handleSearch = (e,{value}) =>{
        clearTimeout(this.state.scheduledFetch)
        if(value.length===0){
            this.setState({
                searchQuery:value,
                tableGames:[],
                isLoading:false,
                scheduledFetch:()=>{}
            })
            if(this.state.activeConsole)
                this.fetchActiveConsoleGames(this.state.activeConsole)
            return
        }
        this.setState({
            searchQuery:value,
            isLoading:true,
            scheduledFetch:setTimeout(()=>this.fetchSearchResults(value),2000)
        })
    }

    fetchSearchResults = async (searchQuery) => {
        try{
            this.setState({ 
                tableGames:[],
            })
            const {activeConsole,lowerLimit,upperLimit} = this.state;
            let url
            if(this.state.activeConsole)
                url=server_url+"/games/search/"+searchQuery+"/"+activeConsole.id+"/"+lowerLimit+"/"+upperLimit
            else url= server_url+"/games/search/"+searchQuery+"/"+lowerLimit+"/"+upperLimit
            
            let response = await axios.get(url)
            this.setState({ 
                isLoading:false, 
                totalPages:Math.ceil(response.data.count/30),
                tableGames:response.data.games
            })
        }
        catch(error){
            this.setState({
                isLoading:false,
            })
        }
    }

    fetchActiveConsoleGames = async(active) => {
        try{
            this.setState({ 
                activeConsole: active, 
                isTableLoading:true, 
                tableGames:[],
                searchQuery:""
            })
            let response = await axios.get(server_url+"/games/list/"+active.id+"/"+this.state.lowerLimit+"/"+this.state.upperLimit)
            this.setState({ 
                isTableLoading:false, 
                totalPages:Math.ceil(response.data.count/30),
                tableGames:response.data.games
            })
        }
        catch(error){
            console.log(error)
            this.setState({ 
                isTableLoading:false,
                searchQuery:"" 
            })
        }
    }

    handleConsoleSelection = async (e,{consoleobj}) => {
        if(this.state.activeConsole===consoleobj){
            this.setState({
                activeConsole: null,
                tableGames:[],
                searchQuery:"",
            })
            return
        }
        if(this.state.isTableLoading)
            return
        this.fetchActiveConsoleGames(consoleobj)
    } 
    
    render() {
        return (
        <React.Fragment>
            <Heading/>
            <Grid id="addplus" columns={3} stackable>
                <Grid.Column width={3} className="sidebar-column" only="computer large screen">
                <Menu pointing secondary vertical className="sidebar-ocean">
                    <div className="sidebar-content">
                        {Object.keys(this.consoles).map((family)=>{
                            return ( 
                                <React.Fragment key={family}>
                                <Menu.Header><h3 className="sidebar-header">{family}</h3></Menu.Header>
                                {this.consoles[family].map((consol)=>{
                                    return (
                                        <Menu.Item 
                                        className="sidebar-item"
                                        key={consol['id']} 
                                        consoleobj={consol} 
                                        name={consol['name']} 
                                        active={this.state.activeConsole ? this.state.activeConsole.name === consol['name']:false} 
                                        onClick={this.handleConsoleSelection}>
                                            {consol['name']}
                                        </Menu.Item>
                                    )})
                                }
                                </React.Fragment>
                            )
                        })}
                    </div>
                </Menu>
                </Grid.Column>
                <Grid.Column width={10} className="table-games-column">
                <Dimmer active={this.state.isTableLoading}> 
                    <Loader size="big" />
                </Dimmer>
                <Segment className="table-games-cell segment-table">
                            Toggle to mark future selections as:&nbsp;&nbsp;
                                    <Image src={Completed}></Image>
                                    <Image src={Beaten}></Image>
                                    <Image src={Unfinished}></Image>
                            <Search
                                showNoResults={false}
                                loading={this.state.isLoading}
                                onSearchChange={debounce(1000,true,this.handleSearch)}
                                value={this.state.searchQuery}
                            />
                </Segment>     
                <Table celled attached unstackable className="table-games">
                    <Table.Header >
                        <Table.Row>
                            <Table.HeaderCell className="table-games-header"></Table.HeaderCell>
                            <Table.HeaderCell className="table-games-header">Title</Table.HeaderCell>
                            <Table.HeaderCell className="table-games-header">Type</Table.HeaderCell>
                            <Table.HeaderCell className="table-games-header mobile hidden" >Playtime</Table.HeaderCell>
                            <Table.HeaderCell className="table-games-header mobile hidden">Rating</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {this.state.tableGames.length===0 ? <Table.Row>
                            <Table.Cell textAlign="center" colSpan={5}>
                                Select a console and/or input search query to look for games!
                            </Table.Cell>
                        </Table.Row> :
                        this.state.tableGames.map((game)=>{
                            let imageURL = this.processImageURL(game)
                            return <Table.Row key={game.id}>
                                        <Table.Cell onClick={this.addGame} selectable textAlign="center" width={2}>
                                            <Icon name="plus"/>
                                        </Table.Cell>
                                        <Table.Cell width={6} singleLine className="table-games-cell">
                                            {imageURL && <Image className="table-game-thumb" src={server_url+imageURL} alt="cover art" />}
                                            {game.title}
                                        </Table.Cell>
                                        <Table.Cell width={3}>
                                            <Container className="table-icon-container">
                                                <Image src={Completed}></Image>
                                                <Image src={Beaten}></Image>
                                                <Image src={Unfinished}></Image>
                                            </Container>
                                        </Table.Cell>
                                        <Table.Cell width={3} className="mobile hidden">
                                            None
                                        </Table.Cell>
                                            <Table.Cell width={2} className="mobile hidden">
                                        </Table.Cell>
                                    </Table.Row>
                        })}
                    </Table.Body>
                </Table>

                {this.state.tableGames.length>29 && <Pagination
                    activePage={this.state.activePage}
                    boundaryRange={2}
                    onPageChange={this.handlePaginationChange}
                    siblingRange={2}
                    totalPages={this.state.totalPages}
                />}
            </Grid.Column>
            <Grid.Column  width={3}>
            <Segment.Group className="additions-segment-group">
                <Segment raised className="additions-header">Additions:</Segment>
            </Segment.Group>
            </Grid.Column>
            </Grid>
        </React.Fragment>
        )
            
    }
} export default Addplus

/*
  
*/