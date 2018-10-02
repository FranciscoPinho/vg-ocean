import React, { Component } from "react"
import Heading from '../Header/Header'
import {Grid,Table,Menu,Segment,Icon,Container,Search,Loader,Dimmer,Pagination,Button,Transition, Accordion} from 'semantic-ui-react'
import {debounce} from 'throttle-debounce'
import axios from 'axios'
import './Addplus.css'
import VGOIcons from '../../components/Common/VGOIcons'
import OverlayTitleCell from './OverlayTitleCell'
import { server_url } from "../.."

class Addplus extends Component {
    constructor(props){
        super(props)
        this.state = {
            tableGames:[],
            addedGames:[],
            windowWidth:0,
            windowHeight:0,
            mobileSidebarWidth:0,
            isLoading:false,
            isTableLoading:false,
            activeIndex: -1,
            activeConsole:null,
            searchQuery:"",
            lastFetchType:"",   
            error:true,
            totalPages:0,
            offset:0,
            activePage:1,
            videoPlaying:false,
            futureSelectionsAs:"",
            scheduledFetch:()=>{}
        }
        this.consoles = {
            'Nintendo':[{id:1,name:'Nintendo Entertainment System',dim:'80x116'},
            {id:4,name:'Super Nintendo',dim:'116x80'},
            {id:5,name:'Game Boy',dim:'80x80'},
            {id:6,name:'Game Boy Color',dim:'80x80'},
            {id:10,name:'Nintendo 64',dim:'80x80'},
            {id:12,name:'Gameboy Advance',dim:'80x80'},
            {id:40,name:'Gamecube',dim:'80x80'},
            {id:41,name:'Nintendo DS',dim:'80x80'},
            {id:42,name:'Wii',dim:'80x80'},
            {id:43,name:'Nintendo 3DS',dim:'80x80'},
            {id:44,name:'Wii U',dim:'80x80'},
            {id:45,name:'Nintendo Switch',dim:'80x80'}],
            'Sega':[{id:3,name:'Master System',dim:'80x116'},
            {id:2,name:'Genesis/Mega Drive',dim:'80x116'},
            {id:7,name:'Sega CD',dim:'80x116'},
            {id:8,name:'Sega 32x',dim:'80x116'},
            {id:10,name:'Sega Saturn',dim:'80x116'},
            {id:11,name:'Dreamcast',dim:'80x80'}],
            'Sony':[{id:9,name:"Playstation",dim:'80x80'},
            {id:13,name:"Playstation 2",dim:'80x80'},
            {id:54,name:"Playstation Portable",dim:'80x80'},
            {id:50,name:"Playstation 3",dim:'80x80'},
            {id:51,name:"Playstation Vita",dim:'80x80'},
            {id:52,name:"Playstation 4",dim:'80x80'},
            {id:53,name:"Playstation VR",dim:'80x80'}],
            'Microsoft':[{id:72,name:"Xbox",dim:'80x116'},
            {id:71,name:"Xbox 360",dim:'80x116'},
            {id:70,name:"Xbox One",dim:'80x116'}],
            'NEC':[{id:25,name:"TurboGrafx-16",dim:'80x80'},
            {id:30,name:"TurboGrafx-CD",dim:'80x80'}],
            'Misc':[{id:90,name:"Steam",dim:'116x80'},
            {id:60,name:"PC",dim:'116x80'},
            {id:61,name:"VR",dim:'80x116'}]
        }
        this.videoRef = null
        this.setVideoRef = element => {
            this.videoRef = element
            if(this.videoRef){
                this.videoRef.volume=0.08
                this.videoRef.addEventListener("ended",()=>{
                    this.setState({
                        videoPlaying:false
                    })
                })
            }          
        }
    }
    componentWillMount(){
        document.title="VGOcean - Add+"
       
    }
    componentDidMount(){
        this.updateWindowDimensions()
        window.addEventListener('resize', this.updateWindowDimensions)
    }

    componentWillUnmount(){
        window.removeEventListener('resize', this.updateWindowDimensions)
        if(this.videoRef)
            this.videoRef.removeEventListener("ended",()=>{})
    }

    updateWindowDimensions = () =>{
        this.setState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight })
    }

    processImageURL = (game) => {
        if(game.cover_platform_uri)
            return game.cover_platform_uri.replace("cover","cover_thumb")
        return ""
    }
    
    mobileOrPortraitTablet = () =>{
        const {windowWidth} = this.state
        return windowWidth<767 || (windowWidth>768 && windowWidth<1200)
    }

    addGame = (newgame) => {
        if(!newgame.type && !this.state.futureSelectionsAs)
            //display error, must choose type first
            return
        const {tableGames,addedGames} = this.state
        tableGames.splice(tableGames.indexOf(newgame),1)
        if(!newgame.type)
            newgame = {...newgame,"type":this.state.futureSelectionsAs}
        if(addedGames.indexOf(newgame)===-1)
            this.setState({
                addedGames:[...addedGames,newgame],
                tableGames: tableGames
            })
    }

    removeGame = (game) => {
        const {tableGames,addedGames,searchQuery} = this.state
        addedGames.splice(addedGames.indexOf(game),1)
        if(tableGames.indexOf(game)===-1)
            if(!searchQuery)
                this.setState({
                    addedGames: addedGames,
                    tableGames: [...tableGames,game].sort((a,b)=>{
                        if(a.title < b.title) return -1
                        if(a.title > b.title) return 1
                        return 0
                    })
                })
            else
                this.setState({
                    addedGames: addedGames,
                    tableGames: [game,...tableGames]
                })
    }

    fetchActiveConsoleGames = async(active,updateVideo=true) => {
        try{
            if(updateVideo)
                this.setState({ 
                    activeConsole: active, 
                    videoPlaying:false,
                    isTableLoading:true, 
                    tableGames:[],
                    searchQuery:""
                })
            else this.setState({
                activeConsole: active, 
                isTableLoading:true, 
                tableGames:[],
                searchQuery:""
            })
            let response = await axios.get(server_url+"/games/list/"+active.id+"/"+this.state.offset)
            if(updateVideo)
                this.setState({ 
                    isTableLoading:false, 
                    videoPlaying:true,
                    lastFetchType:"console",
                    totalPages:Math.ceil(response.data.count/30),
                    tableGames:this.filterAlreadyAddedGames(response.data.games)
                })
            else  this.setState({ 
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
                totalPages:0,
                videoPlaying:false,
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
                this.fetchActiveConsoleGames(this.state.activeConsole,false)
            return
        }
        this.setState({
            searchQuery:value,
            isLoading:true,
            scheduledFetch:setTimeout(()=>this.fetchSearchResults(value),700)
        })
    }

    handlePaginationChange = (e, { activePage }) => {
        this.setState({ 
            offset:30*activePage-30,
            activePage:activePage
        },()=>{
            console.log(this.state)
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
            const {activeConsole,offset} = this.state
            let url
            if(this.state.activeConsole)
                url=server_url+"/games/search/"+searchQuery+"/"+activeConsole.id+"/"+offset
            else url= server_url+"/games/search/"+searchQuery+"/"+offset
            
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
        const {addedGames} = this.state
        let filteredTable = tableGames.filter(game => {
            return !this.checkIfAddedGame(addedGames,game)
        })
        return this.filterGameTitles(filteredTable)
    }

    filterGameTitles = (tableGames) => {
        const {activeConsole} = this.state
        return tableGames.filter(game => {
            game.title=game.title.replace(/\(.*?\)/,'').trim()
            if(!activeConsole)
                game.title=game.title+' '+game.platform
            return game
        })
    }

    checkIfAddedGame = (addedGames,game) => {
        return addedGames.find(addedgame => {
            return addedgame.id===game.id
        })
    }
    consoleAccordionClick = (e,itemProps) => {
        const { index } = itemProps
        const { activeIndex } = this.state
        const newIndex = activeIndex === index ? -1 : index
    
        this.setState({ activeIndex: newIndex })
    }

    renderConsoleAccordion = () =>{
        return ( 
            <div className="sidebar-content">
                {Object.keys(this.consoles).map((family,index)=>{
                    return <Accordion key={family}>
                        <Accordion.Title index={index} active={this.state.activeIndex===index} onClick={this.consoleAccordionClick}> 
                            <h3 className="sidebar-header">{family}<Icon name={this.state.activeIndex===index ? "caret up" : "caret down"}/></h3>
                        </Accordion.Title>
                        <Accordion.Content active={this.state.activeIndex===index}>
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
                        <br/>
                        </Accordion.Content>
                    </Accordion>
                })}
            </div>
        )
    }

    renderSidebar = () =>{
        return (
            <Grid.Column width={3} className="sidebar-column tablet hidden mobile hidden">
                <Menu pointing secondary vertical className="sidebar-ocean sidebar-ocean-desktop">
                    {this.renderConsoleAccordion()}
                </Menu>
            </Grid.Column>
        )
    }
    renderMobileSidebar = () => {
        return <div className="sidenav" style={{width:this.state.mobileSidebarWidth}}>
                <a className="closebtn" onClick={this.closeSidebar}>&times;</a>
                <Menu pointing secondary vertical className="sidebar-ocean" style={{marginLeft:0,width:"auto"}}>
                    {this.renderConsoleAccordion()}
                </Menu>
            </div>
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
        let mobile =  this.mobileOrPortraitTablet()
        mobile ? colspan=2 : colspan=4
        return (
        <div className="table-games-body">
            <Table celled unstackable fixed className="table-games">
                <Table.Header >
                    <Table.Row>
                        <Table.HeaderCell width={colspan===2? 10:8} className="table-games-header">Title</Table.HeaderCell>
                        <Table.HeaderCell width={colspan===2? 6:7}className="table-games-header">Type <span className="mandatory">(mandatory)</span></Table.HeaderCell>
                        {!mobile &&
                            <React.Fragment>
                            <Table.HeaderCell width={3}className="table-games-header" >Playtime</Table.HeaderCell>
                            <Table.HeaderCell width={2}className="table-games-header">Rating</Table.HeaderCell>
                            </React.Fragment>
                        }
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
                                    {!mobile &&
                                    <React.Fragment>
                                    <Table.Cell width={16} className="mobile hidden overflow-x-scroll">
                                        None
                                    </Table.Cell>
                                        <Table.Cell width={16} className="mobile hidden overflow-x-scroll">
                                    </Table.Cell>
                                    </React.Fragment>
                                    }
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
               return <Segment key={game.title} onClick={()=>this.removeGame(game)} className="added-game"><Icon name="minus"/><span className="clip-text">{game.title}</span><VGOIcons singleicon={game.type}/></Segment> 
            })}
            </React.Fragment>
        )
    }

    playBackgroundVideo = () => {
        if(!this.state.activeConsole)
            return null
        switch(this.state.activeConsole.id){
            case 9:
                return  (<video ref={this.setVideoRef} id="background-video" autoPlay>
                            <source src={server_url+"/videos/ps1_startup.mp4"} type="video/mp4" />
                        </video>)
            case 2:
                 return  (<video ref={this.setVideoRef} id="background-video" autoPlay>
                            <source src={server_url+"/videos/gen.mp4"} type="video/mp4" />
                          </video>)
            default:
                return null
        }
    }
    /*
    @TODO flashing mandatory if try to add without selection of icon
    @TODO FIX MOBILE OR TABLET DISPLAY OF THINGS IN GENERAL
    */
    render() {
        let mobile
        this.mobileOrPortraitTablet() ? mobile=true : mobile=false
        return (
        <React.Fragment>
            <Heading/>
            {this.state.videoPlaying && !mobile && this.playBackgroundVideo()}
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