import React, { Component } from 'react';
import Navbar from './Global/Navbar';
import AgentList from './Cosmos/AgentList';
// import CosmosPlot from './Cosmos/CosmosPlot';
import CosmosAgent from './Cosmos/CosmosAgent';
import CosmosAgentJson from './Cosmos/CosmosAgentJson';
import CosmosJsonParser from './Cosmos/CosmosJsonParser';
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

        <div ids='cosmos-plot-json' class= 'cosmos-plot'>
          <CosmosJsonParser />
        </div>
        <div id='cosmos-plot-live' class= 'cosmos-plot'>
          <CosmosAgent />
        </div>
      </div>

    );
  }

}

export default DataPlot;
