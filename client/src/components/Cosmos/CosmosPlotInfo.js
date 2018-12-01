import React, { Component } from 'react';
import { Select } from 'antd';

import io from 'socket.io-client';


const socket = io('http://localhost:3001');
function parseCosmosJson(json){
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

  constructor(props){
    super(props);
    // console.log('CosmosPlotInfo',this.props.jsonObj)
    if(props.jsonObj){

      this.state = {
        agent_selection: props.jsonObj.agent,
        data_length:props.jsonObj.xRange,
        using_json:true,
        valid: false
      };
    }
    else {
      this.state = {
        agents:[],
        data_names:[],
        agent_selection: '',
        data_selection: [],
        data_length: 100,
        using_json: false,
        valid: true
      };
    }

  }

  componentDidMount() {
    if(!this.state.using_json){
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
    else {

      socket.on('agent subscribe '+this.props.jsonObj.agent, (data) => {
        socket.removeAllListeners('agent subscribe '+this.props.jsonObj.agent);
        var saved_state = this.state;
        var names = [];
        names = parseCosmosJson(data);
        console.log(names);
        var vals=[];
        for(var i=0; i <this.props.jsonObj.values.length; i++){
          var match = this.props.jsonObj.values[i].data;
          const result = names.find( fruit => fruit.name === match );
          vals.push(result);
        }
        console.log(vals);
        saved_state.data_names = names;
        saved_state.data_selection = vals;
        if(vals.length > 0){
          saved_state.valid = true;
        }
        this.setState(saved_state);
        this.props.updateInfo( {
              agent_selection:this.state.agent_selection,
              data_selection: vals,
              data_length: this.state.data_length});
      });



    }

  }

  handleAgentChange(value){
    if(!this.state.using_json){
      let prev_selection = 'agent subscribe '+this.state.agent_selection;
      var saved_state = this.state;
      saved_state.agent_selection = String(value);
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
  }

  handleDataChange(value){
    if(!this.state.using_json){
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
      console.log('info: ', this.state);
    }
  }
  update(jsonObj){
    // var saved_state = this.state;
    // saved_state.agent_selection = jsonObj.agent;
    // saved_state.data_length=jsonObj.xRange;
    // saved_state.using_json = true;
    // saved_state.valid = false;
    // this.setState(saved_state);
    // socket.on('agent subscribe '+this.props.jsonObj.agent, (data) => {
    //   socket.removeAllListeners('agent subscribe '+this.props.jsonObj.agent);
    //   var saved_state = this.state;
    //   var names = [];
    //   names = parseCosmosJson(data);
    //   console.log(names);
    //   var vals=[];
    //   for(var i=0; i <this.props.jsonObj.values.length; i++){
    //     var match = this.props.jsonObj.values[i].data;
    //     const result = names.find( fruit => fruit.name === match );
    //     vals.push(result);
    //   }
    //   console.log(vals);
    //   saved_state.data_names = names;
    //   saved_state.data_selection = vals;
    //   if(vals.length > 0){
    //     saved_state.valid = true;
    //   }
    //   this.setState(saved_state);
    //   this.props.updateInfo( {
    //         agent_selection:this.state.agent_selection,
    //         data_selection: vals,
    //         data_length: this.state.data_length});
    // });
  }

  render() {
    const AgentOption = Select.Option;
    var agent_names=[];

    const DataOption = Select.Option;
    var data_key = [];
    var selected_data = [];
    var using_json = false;
    var selected_agent = [];
    if(this.state.using_json){ // using JSON file
      this.update(this.props.jsonObj)
      using_json = true;
      var agent = this.props.jsonObj.agent
      selected_agent.push(agent);
      agent_names.push(<AgentOption key={agent} value={agent}>{agent}</AgentOption>);
      var vals = this.props.jsonObj.values;
      for(var i=0; i < vals.length; i++){
        var key = vals[i].data;
        data_key.push(<DataOption key={key} value={key}>{key}</DataOption>);
        selected_data.push(key);
      }

    }
    else { // not using JSON file
      var agent_list  = this.state.agents;
      var keys = Object.keys(agent_list);

      for(var i =0; i < keys.length; i++){
        agent_names.push(<AgentOption key={String(keys[i])}>{String(keys[i])}</AgentOption>);
      }


      var data_list = this.state.data_names;
      for(var i =0; i < data_list.length; i++){
        var key = String(data_list[i].name);
        var title=key;
        if(data_list[i].num_values >1){
          title+= " ["+String(data_list[i].num_values)+"]";
        }
        else if(data_list[i].num_values === 0){
          title+= " {"+String(data_list[i].children.length)+"}";
        }
        data_key.push(<DataOption key={key} value={i}>{title}</DataOption>);
      }
      selected_data = this.state.data_selection;
      selected_agent= this.state.agent_selection;

    }
    return (
      <div>

        <Select
          mode="single"
          style={{ width: '400px' }}
          placeholder="Select Agent"
          value = {selected_agent=== '' ? 'Select Agent': selected_agent}
          onChange={this.handleAgentChange.bind(this)}
          {... this.state.using_json && 'disabled'}
        >
        {agent_names}
        </Select>
        <Select
          value = {selected_data}
          mode="multiple"
          style={{ width: '400px' }}
          placeholder="Select Data to Plot"

          onChange={this.handleDataChange.bind(this)}
          {... this.state.using_json && 'disabled'}
        >
        {data_key}
        </Select>
        { !this.state.valid && <div> No data to plot </div>}
      </div>
    );


  }

}

export default CosmosPlotInfo;
