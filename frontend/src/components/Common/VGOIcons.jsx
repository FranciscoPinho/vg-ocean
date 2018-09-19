import React, { Component } from "react";
import {
    Image,
    Popup
} from "semantic-ui-react";
import Completed from '../../assets/icons/100_icon.png'
import Finished from '../../assets/icons/completed_icon.png'
import Unplayed from '../../assets/icons/unplayed_icon.png'
import Playing from '../../assets/icons/playing_icon.png'
import OnHold from '../../assets/icons/onhold_icon.png'
import Dropped from '../../assets/icons/ditched_icon2.png'




class VGOIcons extends Component {
    state={
        toggledIcon:''
    }
    
    iconClickHandler = (type,game) => {
        this.setState({
            toggledIcon:type
        })
        if(this.props.addplusIconClickHandler){
            this.props.addplusIconClickHandler(type,game)
        }
    }

    determineIcon = (type) =>{
        switch(type){
            case 'C':
                return <Image className="vgocean-icon" src={Completed}></Image>
            case 'F':
                return <Image className="vgocean-icon" src={Finished}></Image>
            case 'U':
                return <Image className="vgocean-icon" src={Unplayed}></Image>
            case 'P':
                return <Image className="vgocean-icon" src={Playing}></Image>
            case 'H':
                return <Image className="vgocean-icon" src={OnHold}></Image>
            case 'D':
                return <Image className="vgocean-icon" src={Dropped}></Image>
            default:
                return null
        }
    }

    render() {
        if(this.props.singleicon)
            return this.determineIcon(this.props.singleicon)
        return (
        <React.Fragment>
            {this.props.withpopup ? 
             <React.Fragment>
                <Popup trigger={<Image className={this.state.toggledIcon==='C' ? "vgocean-icon icon-toggled" : "vgocean-icon"} src={Completed} onClick={()=>this.iconClickHandler('C',null)}></Image>}  content='100% Completion of game' hideOnScroll />
                <Popup trigger={<Image className={this.state.toggledIcon==='F' ? "vgocean-icon icon-toggled" : "vgocean-icon"} src={Finished} onClick={()=>this.iconClickHandler('F',null)}></Image>} content='Finished main story at least' hideOnScroll />
                <Popup trigger={<Image className={this.state.toggledIcon==='U' ? "vgocean-icon icon-toggled" : "vgocean-icon"} src={Unplayed} onClick={()=>this.iconClickHandler('U',null)}></Image>} content='Plan to play or unplayed' hideOnScroll />
                <Popup trigger={<Image className={this.state.toggledIcon==='P' ? "vgocean-icon icon-toggled" : "vgocean-icon"} src={Playing} onClick={()=>this.iconClickHandler('P',null)}></Image>} content='Currently playing' hideOnScroll />
                <Popup trigger={<Image className={this.state.toggledIcon==='H' ? "vgocean-icon icon-toggled" : "vgocean-icon"} src={OnHold} onClick={()=>this.iconClickHandler('H',null)}></Image>} content='Game is on hold' hideOnScroll />
                <Popup trigger={<Image className={this.state.toggledIcon==='D' ? "vgocean-icon-last icon-toggled" : "vgocean-icon-last"} src={Dropped} onClick={()=>this.iconClickHandler('D',null)}></Image>} content='Dropped the game, it must suck' hideOnScroll />
             </React.Fragment>
             :
             <React.Fragment>
                <Image className={this.state.toggledIcon==='C' ? "vgocean-icon icon-toggled" : "vgocean-icon"} src={Completed} onClick={()=>this.iconClickHandler('C',this.props.game)}></Image>
                <Image className={this.state.toggledIcon==='F' ? "vgocean-icon icon-toggled" : "vgocean-icon"} src={Finished} onClick={()=>this.iconClickHandler('F',this.props.game)}></Image>
                <Image className={this.state.toggledIcon==='U' ? "vgocean-icon icon-toggled" : "vgocean-icon"} src={Unplayed} onClick={()=>this.iconClickHandler('U',this.props.game)}></Image>
                <Image className={this.state.toggledIcon==='P' ? "vgocean-icon icon-toggled" : "vgocean-icon"} src={Playing} onClick={()=>this.iconClickHandler('P',this.props.game)}></Image>
                <Image className={this.state.toggledIcon==='H' ? "vgocean-icon icon-toggled" : "vgocean-icon"} src={OnHold} onClick={()=>this.iconClickHandler('H',this.props.game)}></Image>
                <Image className={this.state.toggledIcon==='D' ? "vgocean-icon-last icon-toggled" : "vgocean-icon-last"} src={Dropped} onClick={()=>this.iconClickHandler('D',this.props.game)}></Image>
             </React.Fragment>
            }
           
        </React.Fragment>
        )
    }
} export default VGOIcons