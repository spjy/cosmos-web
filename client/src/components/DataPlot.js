import React, { Component } from 'react';

import io from 'socket.io-client';
import Navbar from './Global/Navbar';
import AgentList from './Cosmos/AgentList';
import CosmosAgent from './Cosmos/CosmosAgent';
// import CosmosPlotInfo from './Cosmos/CosmosPlotInfo';
import CosmosPlot from './Cosmos/CosmosPlot';
const socket = io('http://localhost:3001');
class DataPlot extends Component {

  // state = {
  //   data:[]
  // }

  // componentDidMount() {
    // socket.on('agent subscribe post527', (data) => { // check if there is a live orbit
    //     if (data) { // check if data exists
    //       var this_data = this.state.data;
    //
    //
    //       var data_entry = {time: data['agent_utc'], temp: data['device_tsen_temp_001'] }
    //       console.log(this_data);
    //       this_data.push(data_entry);
    //       this.setState({
    //         data: this_data
    //
    //       });
    //   }
      // console.log(data);
    // });
  // }

  render() {
    // const ds = new DataSet();
    // const dv = ds.createView().source(this.state.data);
    // dv.transform({
    //   type: 'fold',
    //   fields: [ 'temp' ],
    //   key: 'satellite',
    //   value: 'temperature',
    // });
    // // console.log(this.state.data[0].time);
    // const cols = {
    //   time: {
    //     range: [ 0,1 ]
    //   }
    // }
    return (
      <div>
        <Navbar current="dataplot" />
        <br />
        <AgentList />
        <br/>
        <CosmosPlot/>


      </div>

    );
  }

}

export default DataPlot;
