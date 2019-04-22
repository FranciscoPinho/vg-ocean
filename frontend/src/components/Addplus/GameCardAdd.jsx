import React, { Component } from "react";
import {Card,Image,Icon, Button} from "semantic-ui-react";
import { server_url } from "../..";

class GameCardAdd extends Component {
    state={
        visible:false,
        clickable:true
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

    processClick = () => {
        if(this.state.clickable){
            if(this.props.clickHandler()!==-1)
                this.setState({
                    clickable:false
                })
        }      
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

    backgroundCardStyle = () => {
        let url = server_url+this.props.imageURL;
        return {
            backgroundImage:`url(${url})`,
            backgroundSize:"cover",
            opacity:0.3,
            position:"absolute",
            top: 0, 
            left:0, 
            bottom:0,
            right:0,
            width:this.props.mobile?this.props.platformCardWidth*1.5:this.props.platformCardWidth*2,
            height:this.props.mobile?this.props.platformCardHeight*1.5:this.props.platformCardHeight*2,
        }
    }

    cardStyle = () => {
       
        return {
            width:this.props.mobile?this.props.platformCardWidth*1.5:this.props.platformCardWidth*2,
            height:this.props.mobile?this.props.platformCardHeight*1.5:this.props.platformCardHeight*2,
            background:"transparent"
        }
    }

    cardInside = () => {
        return {
            zIndex:2,
            color:"#fff",
            fontSize:this.props.mobile?"0.8rem":"1rem"
        }
    }
    render() {
        
        return( 
            <Card style={this.cardStyle()} raised>
               
                <Card.Content>
                <Card.Header style={this.cardInside()}>{this.props.title}</Card.Header>
                {this.props.platform && 
                <Card.Meta style={this.cardInside()}>
                    {this.props.platform}
                </Card.Meta>
                }        
                </Card.Content>
                <Card.Content style={this.cardInside()} extra className="pagination-container" >
                <Button>Add</Button>
                </Card.Content>
                <div style={this.backgroundCardStyle()}></div>
            </Card>
               
        )
    }
} export default GameCardAdd
