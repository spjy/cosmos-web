import React, { Component } from 'react';
import { Select } from 'antd';
import io from 'socket.io-client';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';
const socket = io('http://localhost:3001');
class CosmosPlot extends Component {
/* Returns a select box filled with active agents */
constructor(){
  super();
    this.state = {
      agent_selection: '',
      agents:[],
      data_selection: '',
      data_names:[],
      data_length:100,
      data:[]

    };
  }

    componentDidMount() {

      socket.on('agent update list', (data) => { // check if there is a live orbit
        var saved_state = this.state;
        var agent_list = this.state.agents;
          if (data) { // check if data exists
            var keys = Object.keys(data);
            for (var k = 0; k < keys.length; k++){
                agent_list[keys[k]] = data[keys[k]];
            }
          }
          saved_state.agents = agent_list;
          this.setState(saved_state);
      });

    }

    handleAgentChange(value){
      let prev_selection = 'agent subscribe '+this.state.agent_selection;
      var saved_state = this.state;
      saved_state.agent_selection = String(value)
      this.setState(saved_state); // update
      socket.removeAllListeners(prev_selection);
      socket.on('agent subscribe '+this.state.agent_selection, (data) => {
        // console.log(data);
        var saved_state = this.state;
        var keys = Object.keys(data);
        var names = [];
        for(var i = 0; i < keys.length; i++){
          if(keys[i].includes("device_") || keys[i].includes("node_") ){
            names.push(keys[i]);
          }
        }
        // console.log(names);
        // console.log(this.state.agents);
        saved_state.data_names = names;
        this.setState(saved_state); // update
        socket.removeAllListeners('agent subscribe '+this.state.agent_selection);
      });
    }

    handleDataChange(value){
      var saved_state = this.state;
      saved_state.data_selection = String(value);
      saved_state.data = [];
      this.setState(saved_state); // update

      // socket.removeAllListeners(prev_selection);
      socket.on('agent subscribe '+this.state.agent_selection, (data) => {
        if (data) {
          var saved_state = this.state;
          var data_entry ={};
          data_entry['time'] =   data['agent_utc'];
          data_entry[ saved_state.data_selection]= data[String(value)] ;
          // console.log(saved_state.data)
          saved_state.data.push(data_entry);
          if(saved_state.data.length > this.state.data_length){
            saved_state.data.shift();
          }
          this.setState(saved_state);
        }
      });
    }
    render() {
      const AgentOption = Select.Option;
      var agent_list  = this.state.agents;
      var keys = Object.keys(agent_list);
      var agent_names=[]
      for(var i =0; i < keys.length; i++){
        agent_names.push(<AgentOption key={String(keys[i])}>{String(keys[i])}</AgentOption>);
      }
      const DataOption = Select.Option;
      var data_key = [];
      var data_list = this.state.data_names;
      for(var i =0; i < data_list.length; i++){
        data_key.push(<DataOption key={String(data_list[i])}>{String(data_list[i])}</DataOption>);
      }
      const ds = new DataSet();
      const dv = ds.createView().source(this.state.data);
      dv.transform({
        type: 'fold',
        fields: [ String(this.state.data_selection) ],
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

          <Select
            mode="single"
            style={{ width: '400px' }}
            placeholder="Select Agent"
            onChange={this.handleAgentChange.bind(this)}
          >
          {agent_names}
          </Select>
          <Select
            mode="single"
            style={{ width: '400px' }}
            placeholder="Select Data to Plot"
            onChange={this.handleDataChange.bind(this)}
          >
          {data_key}
          </Select>
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
