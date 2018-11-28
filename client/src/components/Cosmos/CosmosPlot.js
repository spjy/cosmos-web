import React, { Component } from 'react';
// import Plot from 'react-plotly.js';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';

import io from 'socket.io-client';

const socket = io('http://localhost:3001');
class CosmosPlot extends Component {

  state = {
    data:[]
  }

  componentDidMount() {
    socket.on('agent subscribe post527', (data) => { // check if there is a live orbit
        if (data) { // check if data exists
          var this_data = this.state.data;


          var data_entry = {time: data['agent_utc'], temp: data['device_tsen_temp_001'] }
          // console.log(this_data);
          this_data.push(data_entry);
          this.setState({
            data: this_data

          });
      }
      // console.log(data);
    });
  }

  render() {
    const ds = new DataSet();
    const dv = ds.createView().source(this.state.data);
    dv.transform({
      type: 'fold',
      fields: [ 'temp' ],
      key: 'satellite',
      value: 'temperature',
    });
    // console.log(this.state.data[0].time);
    const cols = {
      time: {
        range: [ 0,1 ]
      }
    }
    return (
      <div>
        <Chart height={400} data={dv} scale={cols} forceFit>
          <Legend />
          <Axis name="time" />
          <Axis name="temperature" label={{formatter: val => `${val}°F`}}/>
          <Tooltip crosshairs={{type : "y"}}/>
          <Geom type="line" position="time*temperature" size={2} color={'satellite'} />
          <Geom type='point' position="time*temperature" size={4} shape={'circle'} color={'satellite'} style={{ stroke: '#fff', lineWidth: 1}} />
        </Chart>
      </div>

    );
  }

}

export default CosmosPlot;
