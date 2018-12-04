import React, { Component } from 'react';
import Navbar from './Global/Navbar';
import CosmosAgent from './Cosmos/CosmosAgent';
import CosmosJsonParser from './Cosmos/CosmosJsonParser';
class DataPlot extends Component {

  render() {

    return (
      <div>
        <Navbar current="dataplot" />
        <br />

        <div ids='cosmos-plot-json' className= 'cosmos-plot'>
          <CosmosJsonParser />
        </div>
        <div id='cosmos-plot-live' className= 'cosmos-plot'>
          <CosmosAgent />
        </div>
      </div>

    );
  }

}

export default DataPlot;
