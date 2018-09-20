import React, { Component } from "react"
import Heading from '../Header/Header'
import {Grid,Table,Menu,Segment,Icon,Container,Search,Loader,Dimmer,Pagination,Button,Transition} from 'semantic-ui-react'
import {debounce} from 'throttle-debounce'
import axios from 'axios'
import './Addplus.css'
import VGOIcons from '../../components/Common/VGOIcons'
import OverlayTitleCell from './OverlayTitleCell'
import { server_url } from "../..";


class Addplus extends Component {
    state = {
        tableGames:[],
        addedGames:[],
        windowWidth:0,
        windowHeight:0,
        mobileSidebarWidth:200,
        isLoading:false,
        isTableLoading:false,
        activeConsole:null,
        searchQuery:"",
        lastFetchType:"",   
        error:true,
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
    componentDidMount(){
        this.updateWindowDimensions()
        window.addEventListener('resize', this.updateWindowDimensions);
    }
    componentWillUnmount(){
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions = () =>{
        this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight });
    }

    processImageURL = (game) => {
        if(game.cover_platform_uri)
            return game.cover_platform_uri.replace("cover","cover_thumb")
        return ""
    }
    
    mobileOrPortraitTablet = () =>{
        const {windowWidth} = this.state
        return windowWidth<767 || (windowWidth>768 && windowWidth<991)
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
        this.closeSidebar()
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
            window.scrollTo(0, 0)
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
                tableGames:tableGames,
                error:false
            })
        }
        else this.setState({
            futureSelectionsAs:type,
            error:false
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
                <Menu pointing secondary vertical className="sidebar-ocean sidebar-ocean-desktop">
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
    renderMobileSidebar = () => {
        return (
        <div className="sidenav" style={{width:this.state.mobileSidebarWidth}}>
             <a class="closebtn" onClick={this.closeSidebar}>&times;</a>
             <Menu pointing secondary vertical className="sidebar-ocean" style={{marginLeft:0,width:"auto"}}>
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
        </div>
        )
    }
    openSidebar=()=>{
        this.setState({
            mobileSidebarWidth:200
        })
    }
    closeSidebar=()=>{
        this.setState({
            mobileSidebarWidth:0
        })
    }
    renderTableGames = () => {
        let colspan
        this.mobileOrPortraitTablet() ? colspan=2 : colspan=4
        return (
        <div className="table-games-body">
            <Table celled unstackable fixed className="table-games">
                <Table.Header >
                    <Table.Row>
                        <Table.HeaderCell width={colspan===2? 10:8} className="table-games-header">Title</Table.HeaderCell>
                        <Table.HeaderCell width={colspan===2? 6:8}className="table-games-header">Type <span className="mandatory">(mandatory)</span></Table.HeaderCell>
                        <Table.HeaderCell width={2}className="table-games-header mobile hidden" >Playtime</Table.HeaderCell>
                        <Table.HeaderCell width={2}className="table-games-header mobile hidden">Rating</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
               
                    {this.state.tableGames.length===0 ? 
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell textAlign="center" colSpan={colspan}>
                                <span className="lightgrey-font">Select a console and/or input search query to look for games!</span>
                            </Table.Cell>
                        </Table.Row> 
                    </Table.Body>
                    :
                    <Transition.Group as={Table.Body} duration={500} animation={colspan===2?"fly up":"fly left"}>
                    {this.state.tableGames.map((game)=>{
                        let imageURL = this.processImageURL(game)
                        return <Table.Row key={game.id}>

                                    <OverlayTitleCell imageURL={imageURL} title={game.title} clickHandler={()=>this.addGame(game)}/>
                       
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
                    </Transition.Group>
                    
                    }
                  
             </Table>
            </div>
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
    @TODO flashing mandatory if try to add without selection of icon
    @TODO FIX MOBILE OR TABLET DISPLAY OF THINGS IN GENERAL
    */
    render() {
        let mobile;
        this.mobileOrPortraitTablet() ? mobile=true : mobile=false
        return (
        <React.Fragment>
            <Heading/>
            <Grid id="addplus" stackable>
                {!mobile ? this.renderSidebar():this.renderMobileSidebar()}
               
                <Grid.Column width={10}>
                <Dimmer active={this.state.isTableLoading}> 
                    <Loader size="big" />
                </Dimmer>
                <Segment className={mobile ? "segment-table lightgrey-font":"inline-flex-centered segment-table lightgrey-font"}>
                    <div className="inline-flex-centered">
                        Toggle to mark future selections as:&nbsp;&nbsp;
                        <VGOIcons className="icons" addplusIconClickHandler={this.iconClickHandler} withpopup />
                    </div>
                    {mobile ?
                    <div className="search-div-mobile">
                    <Icon onClick={this.openSidebar} className="sidebar-ocean-hamburguer" inverted name='bars' size='large'/>
                    <Search
                        style={{textAlign:"center",paddingTop:"5px"}}
                        showNoResults={false}
                        loading={this.state.isLoading}
                        onSearchChange={debounce(1000,true,this.handleSearch)}
                        value={this.state.searchQuery}
                    />
                    </div>
                    :
                    <Search
                        showNoResults={false}
                        loading={this.state.isLoading}
                        onSearchChange={debounce(1000,true,this.handleSearch)}
                        value={this.state.searchQuery}
                    />
                    }  
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
            
            <Segment raised className="additions-header lightgrey-font">Adding to collection:</Segment>    
            <Segment.Group className="additions-segment-group">
                {this.renderAddedGames()}
            </Segment.Group>
            {this.state.addedGames.length>0 && 
            <div className="add-all-button-div">
            <Button>Add all</Button>
            </div>}
            </Grid.Column>
            </Grid>
        </React.Fragment>
        )
            
    }
} export default Addplus

/*
  
*/