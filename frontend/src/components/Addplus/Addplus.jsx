import React, { Component } from "react"
import Heading from '../Header/Header'
import {Grid,Table,Menu,Segment,Image,Icon,Container,Search,Loader,Dimmer,Pagination} from 'semantic-ui-react'
import {debounce} from 'throttle-debounce'
import axios from 'axios'
import './Addplus.css'
import VGOIcons from '../../components/Common/VGOIcons'
import { server_url } from "../..";


class Addplus extends Component {
    state = {
        tableGames:[],
        addedGames:[],
        isLoading:false,
        isTableLoading:false,
        activeConsole:null,
        searchQuery:"",
        lastFetchType:"",
        totalPages:0,
        lowerLimit:0,
        upperLimit:30,
        activePage:1,
        futureSelectionsAs:"",
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
    
    mobileOrPortraitTablet = () =>{
        //(max-width: 767px)
        return window.width<767 || (window.width>768 && window.width<991)
    }
    addGame = (newgame) => {
        if(!newgame.type && !this.state.futureSelectionsAs)
            //display error, must choose type first
            return

        const {tableGames,addedGames} = this.state;
        tableGames.splice(tableGames.indexOf(newgame),1)
        if(!newgame.type)
            newgame = {...newgame,"type":this.state.futureSelectionsAs}

        this.setState({
            addedGames:[...addedGames,newgame],
            tableGames: tableGames
        })
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
                lastFetchType:"console",
                totalPages:Math.ceil(response.data.count/30),
                tableGames:this.filterAlreadyAddedGames(response.data.games)
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

    handlePaginationChange = (e, { activePage }) => {
        this.setState({ 
            lowerLimit:30*activePage-30,
            upperLimit:30*activePage,
            activePage:activePage
        },()=>{
            if(this.state.lastFetchType==="search")
            this.fetchSearchResults(this.state.searchQuery)
            if(this.state.lastFetchType==="console")
                this.fetchActiveConsoleGames(this.state.activeConsole)
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
                lastFetchType:"search",
                totalPages:Math.ceil(response.data.count/30),
                tableGames:this.filterAlreadyAddedGames(response.data.games)
            })
        }
        catch(error){
            this.setState({
                isLoading:false,
            })
        }
    }

 

    iconClickHandler = (type,game) => {
        let tableGames=this.state.tableGames
        if(game){
            let i = tableGames.indexOf(game)
            tableGames[i]={...tableGames[i],"type":type}
            this.setState({
                tableGames:tableGames
            })
        }
        else this.setState({
            futureSelectionsAs:type
        })
    }

    filterAlreadyAddedGames = (tableGames) => {
        const {addedGames} = this.state;
        let filteredTable = tableGames.filter(game => {
            return !this.checkIfAddedGame(addedGames,game)
        })
        return filteredTable
    }

    checkIfAddedGame = (addedGames,game) => {
        return addedGames.find(addedgame => {
            return addedgame.id===game.id
        })
    }

    renderSidebar = () =>{
        return (
            <Grid.Column width={3} className="sidebar-column tablet hidden mobile hidden">
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
        )
    }

    renderTableGames = () => {
        let colspan
        this.mobileOrPortraitTablet() ? colspan=2 : colspan=4
        return (
            <Table celled unstackable fixed className="table-games">
                <Table.Header >
                    <Table.Row>
                        <Table.HeaderCell width={8} className="table-games-header">Title</Table.HeaderCell>
                        <Table.HeaderCell width={colspan===2? 16:8}className="table-games-header">Type <span className="mandatory">(mandatory)</span></Table.HeaderCell>
                        <Table.HeaderCell width={2}className="table-games-header mobile hidden" >Playtime</Table.HeaderCell>
                        <Table.HeaderCell width={2}className="table-games-header mobile hidden">Rating</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {this.state.tableGames.length===0 ? 
                    <Table.Row>
                        <Table.Cell textAlign="center" colSpan={colspan}>
                            Select a console and/or input search query to look for games!
                        </Table.Cell>
                    </Table.Row> 
                    :
                    this.state.tableGames.map((game)=>{
                        let imageURL = this.processImageURL(game)
                        return <Table.Row key={game.id}>
                                    <Table.Cell width={16} singleLine className="inline-flex-centered overflow-x-scroll" onClick={()=>this.addGame(game)}>
                                        {imageURL && <Image className="table-game-thumb" src={server_url+imageURL} alt="cover art" />}
                                        {game.title}
                                    </Table.Cell>
                                    <Table.Cell width={16} className="overflow-x-scroll">
                                        <Container className="table-icon-container">
                                            <VGOIcons addplusIconClickHandler={this.iconClickHandler} game={game} />
                                        </Container>
                                    </Table.Cell>
                                    <Table.Cell width={16} className="mobile hidden overflow-x-scroll">
                                        None
                                    </Table.Cell>
                                        <Table.Cell width={16} className="mobile hidden overflow-x-scroll">
                                    </Table.Cell>
                                </Table.Row>
                    })}
                </Table.Body>
             </Table>
        )
    }

    renderAddedGames = () =>  {
        return (
            <React.Fragment>
            {this.state.addedGames.map((game)=>{
               return <Segment key={game.title} className="added-game"><Icon name="minus"/><span className="clip-text">{game.title}</span><VGOIcons singleicon={game.type}/></Segment> 
            })}
            </React.Fragment>
        )
    }
    /*
    @TODO SIDEBAR FOR MOBILE OR TABLE
    @TODO FIX MOBILE OR TABLET DISPLAY OF THINGS IN GENERAL
    */
    render() {
        return (
        <React.Fragment>
            <Heading/>
            <Grid id="addplus" stackable>
                {this.renderSidebar()}
               
                <Grid.Column width={10} className="table-games-column">
                <Dimmer active={this.state.isTableLoading}> 
                    <Loader size="big" />
                </Dimmer>
                <Segment className="inline-flex-centered segment-table">
                            Toggle to mark future selections as:&nbsp;&nbsp;
                            <VGOIcons className="icons" addplusIconClickHandler={this.iconClickHandler} withpopup />
                            <Search
                                showNoResults={false}
                                loading={this.state.isLoading}
                                onSearchChange={debounce(1000,true,this.handleSearch)}
                                value={this.state.searchQuery}
                            />
                </Segment>     
                {this.renderTableGames()}
                {this.state.totalPages>1 && 
                <div className="pagination-container">
                    <Pagination
                    activePage={this.state.activePage}
                    boundaryRange={1}
                    onPageChange={this.handlePaginationChange}
                    siblingRange={1}
                    totalPages={this.state.totalPages}
                    />
                </div>
                }
            </Grid.Column>
            <Grid.Column width={3}>
            <Segment.Group className="additions-segment-group">
                <Segment raised className="additions-header">Additions:</Segment>
                {this.renderAddedGames()}
            </Segment.Group>
            </Grid.Column>
            </Grid>
        </React.Fragment>
        )
            
    }
} export default Addplus

/*
  
*/