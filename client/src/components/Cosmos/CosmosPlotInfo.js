import React, { Component } from 'react';
import { Select } from 'antd';

import io from 'socket.io-client';


const socket = io('http://localhost:3001');
function parseCosmosJson(json){
  /* returns array of data json names with properties */
  var keys = Object.keys(json);
  var names = [];
  for(var i = 0; i < keys.length; i++){
    var entry = json[keys[i]];
    var name = keys[i];
    var vals = 0;
    var children = [];
    if(!name.includes("agent_")) {
      if(Array.isArray(entry)){
        // if the value is an array
        vals = entry.length;
      }
      else if(typeof entry === 'object') {
        vals = 0;
        children = parseCosmosJson(entry);
      }
      else {
        vals = 1;
      }
      names.push({
        name:name,
        num_values: vals,
        children: children
      });
    }
  }
  return names;
}


class CosmosPlotInfo extends Component {

  constructor(){
    super();
      this.state = {
        agents:[],
        data_names:[],
        agent_selection: '',
        data_selection: [],
        data_length:100
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
    saved_state.data_selection=[];
    this.setState(saved_state); // update
    socket.removeAllListeners(prev_selection);
    socket.on('agent subscribe '+this.state.agent_selection, (data) => {
      /* get data keys */
      var saved_state = this.state;

      // console.log(parseCosmosJson(data));
      saved_state.data_names = parseCosmosJson(data);
      this.setState(saved_state); // update
      socket.removeAllListeners('agent subscribe '+this.state.agent_selection);
    });
  }

  handleDataChange(value){
    // console.log(value)
    var saved_state = this.state;
    // saved_state.data_selection = value;
    saved_state.data_selection = value;
    this.setState(saved_state); // update

    var data=[];
    for(var i = 0; i <value.length; i++){
      data.push(this.state.data_names[value[i]]);
    }
    var properties = {
      agent_selection:this.state.agent_selection,
      data_selection: data,
      data_length: this.state.data_length };
    this.props.updateInfo(properties);
    // console.log('info: ', this.state);
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
      var key = String(data_list[i].name);
      var title=key;
      if(data_list[i].num_values >1){
        title+= " ["+String(data_list[i].num_values)+"]";
      }
      else if(data_list[i].num_values ==0){
        title+= " {"+String(data_list[i].children.length)+"}";
      }
      data_key.push(<DataOption key={key} value={i}>{title}</DataOption>);
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
          value = {this.state.data_selection}
          mode="multiple"
          style={{ width: '400px' }}
          placeholder="Select Data to Plot"
          onChange={this.handleDataChange.bind(this)}
        >
        {data_key}
        </Select>
      </div>
    );
  }

}

export default CosmosPlotInfo;
