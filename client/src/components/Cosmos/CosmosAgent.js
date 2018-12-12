import React, { Component } from 'react';
import io from 'socket.io-client';
import CosmosPlot from './CosmosPlot';
import cosmosInfo from './CosmosInfo'
import { Select } from 'antd';
const socket = io(cosmosInfo.socket);

function get_data_list(json) {
  /* returns array of data json names with properties
  - used to handle nested objects withint json data object
  ex: { name: 'device_tsen_temp_000',
        num_values: 1,
        children: []
      }
  */
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
        children = get_data_list(entry);
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


class CosmosAgent extends Component {
/* CosmosPlot without json config */
  constructor(props){
    super(props);
    this.state = {

      agents:[],
      data_list: [],
      data_selection:[],
      agent_selection: ''
    };

  }

    componentDidMount() {
        /* generate agent_list  */
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
    componentWillUnmount() {
      // Remove listeners
        socket.removeAllListeners('agent update list');


    }
    updateAgent(agent){
      // call when agent selection is changed
      socket.on('agent subscribe '+agent, (data) => { // subscribe to agent
        if (data) {
          console.log(data)

          var data_list = get_data_list(data);

          var saved_state = this.state;
          saved_state.data_list = data_list;
          saved_state.data_selection=[];
          saved_state.agent_selection = agent;

          this.setState(saved_state);
          socket.removeAllListeners('agent subscribe '+ agent); // unsubscribe to agent
        }
      });
    }

    handleAgentChange(value){
        this.updateAgent(String(value));
        // console.log(this.state);
    }
    handleDataChange(value){
      var data=[];
      for(var i = 0; i <value.length; i++){
        const result = this.state.data_list.find( f=> f.name === value[i]);
        if(result)
          data.push(result);
      }
      var saved_state = this.state;
      saved_state.data_selection = data;
      this.setState(saved_state); // update
    }



    render() {
      const AgentOption = Select.Option;
      var agent_names=[];
      const DataOption = Select.Option;
      var data_key = [];
      var selected_data = [];
      var selected_agent = [];

      var agent_list  = this.state.agents;
      var keys = Object.keys(agent_list);
      for(var i =0; i < keys.length; i++){
        agent_names.push(<AgentOption key={String(keys[i])}>{String(keys[i])}</AgentOption>);
      }

      var data_list = this.state.data_list;
      for(var j =0; j < data_list.length; j++){
        var key = String(data_list[j].name);
        var title=key;
        if(data_list[j].num_values >1){
          title+= " ["+String(data_list[j].num_values)+"]";
        }
        else if(data_list[j].num_values === 0){
          title+= " {"+String(data_list[j].children.length)+"}";
        }
        data_key.push(<DataOption key={key} value={key}>{title}</DataOption>);
      }


      for(var k=0; k < this.state.data_selection.length; k++){
        selected_data.push(this.state.data_selection[k].name);
      }
      selected_agent= this.state.agent_selection;

      const cPlot = (this.state.data_selection.length > 0 ) ?
        <CosmosPlot data_selected={this.state.data_selection} agent ={selected_agent}/>
        :<h3> No valid data to plot</h3> ;

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
            value = {selected_data}
            mode="multiple"
            style={{ width: '400px' }}
            placeholder="Select Data to Plot"

            onChange={this.handleDataChange.bind(this)}
          >
          {data_key}
          </Select>
          {cPlot}
        </div>


      );

    }

}

export default CosmosAgent;
