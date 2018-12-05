import React, { Component } from 'react';
import io from 'socket.io-client';
import CosmosPlot from './CosmosPlot';
import { Select , Icon } from 'antd';
import { Button } from 'antd';
const socket = io('http://localhost:3001');

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


class CosmosAgentJson extends Component {
/* CosmosPlot using .json configuration file */
  constructor(props){
    super(props);
      this.state = {
        data_list: [],
        data_selection:[],
        agent_selection: '',
        edit:false
      };


  }

    componentDidMount() {
      if(!this.props.jsonObj.agent==='')
        this.updateAgent(this.props.jsonObj.agent);
    }

    componentDidUpdate(prevProps) {
      // Typical usage (don't forget to compare props):
      if (this.props.jsonObj !== prevProps.jsonObj) {
        // console.log("CosmosAgentJson agent changed ", this.props.jsonObj.agent );
        this.updateAgent(String(this.props.jsonObj.agent));
      }

    }

    updateAgent(agent){
      // call when agent selection is changed
      console.log("CosmosAgentJson updateAgent")
      socket.on('agent update list', (data) => { // check if there is a live orbit
        var agent_list = [];
        var agent_live = false;
          if (data) { // check if data exists
            var keys = Object.keys(data);
            for (var k = 0; k < keys.length; k++){
                agent_list.push(data[keys[k]]);
                if(keys[k] === agent){
                  agent_live=true;
                }
            }
          }

          if(agent_live) {
            socket.on('agent subscribe '+agent, (data) => { // subscribe to agent
              if (data) {
                // console.log(data)

                var data_list = get_data_list(data);

                var data_selection = this.getDataList(data_list);
                // console.log('CosmosAgent: updateAgent() data_sel',data_selection)
                var saved_state = this.state;
                saved_state.data_list = data_list;
                saved_state.data_selection=(data_selection[0] ? data_selection : []);
                saved_state.agent_selection = agent;

                this.setState(saved_state);
                socket.removeAllListeners('agent subscribe '+ agent); // unsubscribe to agent
              }
            });
            socket.removeAllListeners('agent update list');
          }
          else {
            this.setState({
              data_list: [],
              data_selection:[],
              agent_selection: agent
            });
          }

      });


    }
    getDataList(data_list){
      var selected = [];

      // console.log("cosmosAgent:getDataList: jsonObj.vals: ", this.props.jsonObj.values);
      var vals = this.props.jsonObj.values;
      for(var i =0; i < vals.length; i++){
        var match = vals[i].data;
        const result = data_list.find( f=> f.name === match);
        if(result)
          selected.push(result);
        else
          console.log(match, " is wrong")
      }
      return selected;
    }
    onClickEdit(){
      var saved_state = this.state;
      saved_state.edit = true;
      this.setState(saved_state);
      socket.on('agent update list', (data) => { // check if there is a live orbit
        var agent_list = [];
          if (data) { // check if data exists
            var keys = Object.keys(data);
            for (var k = 0; k < keys.length; k++){
                agent_list.push(data[keys[k]]);

            }
          }
        });

    }
    onClickSave(){
      var saved_state = this.state;
      saved_state.edit = false;
      this.setState(saved_state);
      socket.removeAllListeners('agent update list');
      // update json
    }
    onClickCancel(){
      this.updateAgent(this.props.jsonObj.agent);
      var saved_state = this.state;
      saved_state.edit = false;
      this.setState(saved_state);
      socket.removeAllListeners('agent update list');
    }


    render() {
      const AgentOption = Select.Option;
      var agent_names=[];
      const DataOption = Select.Option;
      var data_key = [];
      var selected_data = [];
      var selected_agent = [];

      var agent = this.props.jsonObj.agent
      selected_agent.push(agent);
      agent_names.push(<AgentOption key={agent} value={agent}>{agent}</AgentOption>);
      var vals = this.props.jsonObj.values;
      for(var i=0; i < vals.length; i++){
        var key = vals[i].data;
        data_key.push(<DataOption key={key} value={key}>{key}</DataOption>);
        selected_data.push(key);
      }

      console.log("CosmosAgentJson: render() datalen: ",this.state.data_selection.length);
      const cPlot = (this.state.data_selection.length > 0 ) ?
        <CosmosPlot data_selected={this.state.data_selection} agent ={this.props.jsonObj.agent}/>
        :<h3> No valid data to plot</h3>;

      const buttons = this.state.edit ?
      <Button.Group>
          <Button type='primary'  onClick={this.onClickSave.bind(this)}> Save</Button>
          <Button type='danger' onClick={this.onClickCancel.bind(this)}>Cancel</Button></Button.Group>
          : <Button type='default' onClick={this.onClickEdit.bind(this)}><Icon type="edit" /></Button> ;
      return (

        <div>

          <Select
            mode="single"
            style={{ width: '400px' }}
            placeholder="Select Agent"
            value = {this.props.jsonObj.agent}
            disabled
          >
          {agent_names}
          </Select>
          <Select
            value = {selected_data}
            mode="multiple"
            style={{ width: '400px' }}
            placeholder="Select Data to Plot"
            disabled
          >
          {data_key}
          </Select>
          {buttons}
          {cPlot}
        </div>


      );

    }

}

export default CosmosAgentJson;
