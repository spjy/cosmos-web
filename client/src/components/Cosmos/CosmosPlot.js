import React, { Component } from 'react';
import { Select } from 'antd';
import io from 'socket.io-client';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';
import CosmosPlotInfo from './CosmosPlotInfo';

const socket = io('http://localhost:3001');
class CosmosPlot extends Component {
/* Returns a select box filled with active agents */
constructor(){
  super();
    this.state = {
      agent_selection: '',
      data_selection: '',
      data_length:0,
      data:[]
    };

  }

    componentDidMount() {



    }
    componentWillUnmount() {
      var prevState = this.state.agent_selection;
      socket.removeAllListeners('agent subscribe '+prevState);
    }
    updateInfo(info){
      var prevState = this.state.agent_selection;
      var state = {
        agent_selection: info[0],
        data_selection: info[1],
        data_length:info[2],
        data:[]
        };
      this.setState(state);
      socket.removeAllListeners('agent subscribe '+prevState);
      socket.on('agent subscribe '+state.agent_selection, (data) => {
        if (data) {
          console.log(data)
          var saved_state = this.state;
          var data_entry ={};
          data_entry['time'] =   data['agent_utc'];
          for(var i=0; i <this.state.data_selection.length; i++){
            data_entry[ saved_state.data_selection[i]]= data[saved_state.data_selection[i]] ;
          }
          // console.log(data_entry)
          saved_state.data.push(data_entry);
          if(saved_state.data.length > this.state.data_length){
            saved_state.data.shift();
          }
          this.setState(saved_state);
        }
      });
    }


    render() {
      // console.log('render', String(this.state.data_selection[1]));
      const ds = new DataSet();
      const dv = ds.createView().source(this.state.data);
      dv.transform({
        type: 'fold',
        fields:  this.state.data_selection ,
        key: 'satellite',
        value: 'temperature',
      });
      const cols = {
        time: {
          range: [ 0,1 ]
        }
      }
      return (
        <div>
          <CosmosPlotInfo updateInfo = {this.updateInfo.bind(this)} />
          <Chart height={400} data={dv} scale={cols} forceFit>
            <Legend />
            <Axis name="time" />
            <Axis name="Data" label={{formatter: val => `${val}°F`}}/>
            <Tooltip crosshairs={{type : "y"}}/>
            <Geom type="line" position="time*temperature" size={2} color={'satellite'} />
            <Geom type='point' position="time*temperature" size={4} shape={'circle'} color={'satellite'} style={{ stroke: '#fff', lineWidth: 1}} />
          </Chart>
        </div>
      );
    }
}

export default CosmosPlot;
