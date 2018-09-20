import React, { Component } from "react";
import {Segment,Image,Table,Icon} from "semantic-ui-react";
import { server_url } from "../..";

class OverlayTitleCell extends Component {
    state={
        visible:false
    }
    
    hoverBegin = () => {
        this.setState({
            visible:true
        })
    }

    hoverEnd = () => {
        this.setState({
            visible:false
        })
    }
    
    segmentStyle = () => {
        return {
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            position:"absolute",
            bottom:"0%",
            width:"100%",
            backgroundColor:"darkgrey",
            height:this.state.visible ? "40%":0,
            overflow:this.state.visible ? "initial":"hidden",
            padding:0,
            opacity:this.state.visible ? 1:0,
            transition:"all .5s ease"
        }
    }
        
    render() {
        return( 
                <Table.Cell onClick={this.props.clickHandler} onMouseOver={this.hoverBegin} onMouseLeave={this.hoverEnd} width={16} singleLine className="inline-flex-centered overflow-x-scroll">
                    <div style={{position:"relative",display:"inline-flex"}} >
                    {this.props.imageURL && <Image  className="table-game-thumb" style={{opacity:this.state.visible ? 0.5:1}} src={server_url+this.props.imageURL} alt="cover art"/>}
                    <Segment className="" style={this.segmentStyle()}><Icon name="plus"/></Segment>
                    </div>  
                    {this.props.title}
                </Table.Cell>
        )
    }
} export default OverlayTitleCell