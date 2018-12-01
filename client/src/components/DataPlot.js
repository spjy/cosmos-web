import React, { Component } from 'react';

import io from 'socket.io-client';
import Navbar from './Global/Navbar';
import AgentList from './Cosmos/AgentList';
import CosmosPlot from './Cosmos/CosmosPlot';
import CosmosJsonParser from './Cosmos/CosmosJsonParser';
const socket = io('http://localhost:3001');
class DataPlot extends Component {

  state= {
    jsonArray: []
  }

  onJsonUpload(arr){
    this.setState({jsonArray: arr});
  }
  render() {

    var plots = (this.state.jsonArray ? this.state.jsonArray: []) ;
    return (
      <div>
        <Navbar current="dataplot" />
        <br />
        <AgentList />
        <br/>
        <CosmosJsonParser updateJsonObj = {this.onJsonUpload.bind(this)}/>
        { plots.map(function(p, index){
          return <CosmosPlot key={index} jsonObj = {p} />;
        })}
        <CosmosPlot/>


      </div>

    );
  }

}

export default DataPlot;
