import React, { Component } from 'react';
import io from 'socket.io-client';
import CosmosPlot from './CosmosPlot';
import { Select , Icon } from 'antd';
import { Button } from 'antd';
import cosmosInfo from './CosmosInfo'
const socket = io(cosmosInfo.socket);
const agent_status = {
  INACTIVE:0,
  ACTIVE:1,
  NONE:2
};
const edit_mode = {
  LOADING: 0,
  EDIT: 1,
  DEFAULT: 2
};

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
    var edit_state = edit_mode.DEFAULT;
    // if(props.jsonObj.agent==='null') edit_state = edit_mode.EDIT;
      this.state = {
        data_list: [],
        data_selection:[],
        agent_selection: '',
        agents:[],
        edit: edit_state,
        agent_status: agent_status.NONE
      };


  }

    componentDidMount() {
      if(this.props.jsonObj.agent!=='')
        this.updateAgent(this.props.jsonObj.agent);
    }

    componentDidUpdate(prevProps) {
      // Typical usage (don't forget to compare props):
      // Called when props.jsonObj is changed
      if (this.props.jsonObj !== prevProps.jsonObj) {
        // console.log("CosmosAgentJson agent changed ", this.props.jsonObj.agent );
        this.setState({
          data_list: [],
          data_selection:[],
          agent_list:[],
          agent_selection: '',
          agent_status:agent_status.NONE,
          edit: edit_mode.DEFAULT
        });
        this.updateAgent(String(this.props.jsonObj.agent));
      }

    }
    componentWillUnmount() {
      // Remove listeners
        socket.removeAllListeners('agent update list');
        socket.removeAllListeners('agent subscribe '+this.props.jsonObj.agent);
        socket.removeAllListeners('agent subscribe '+this.state.agent_selection);
    }

    updateAgent(agent){
      // call when agent selection is changed
      // console.log("CosmosAgentJson updateAgent", agent)
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
                saved_state.agent_status=agent_status.ACTIVE;

                this.setState(saved_state);
                socket.removeAllListeners('agent subscribe '+ agent); // unsubscribe to agent
              }
            });
            socket.removeAllListeners('agent update list');
          }
          else {
            console.log("CosmosAgentJson updateAgent dead", agent, this.props.id)
            this.setState({
              data_list: [],
              data_selection:[],
              agent_list:[],
              agent_selection: agent,
              agent_status:agent_status.INACTIVE,
              edit: this.state.edit
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


      }
      return selected;
    }
    makeJsonObj(){
      var obj =  {
              "agent": this.state.agent_selection,
              "node": "",
              "title": "",
              "values": [
              ],
              "visible": 1,
              "xLabel": "",
              "xRange": 100,
              "yLabel": "",
              "yRange": 0
          };
      for(var i=0; i < this.state.data_selection.length; i++){
        obj['values'].push({
          "data": this.state.data_selection[i].name,
            "logdata": 1,
            "name": "",
            "precision": 7,
            "scale": 1,
            "units": ""
        });
      }
      return obj;
    }


    onClickEdit(){
      var saved_state = this.state;
      saved_state.edit = edit_mode.LOADING;
      this.setState(saved_state);
      socket.on('agent update list', (data) => { // check if there is a live orbit
        var agent_list = [];
          if (data) { // check if data exists

            var keys = Object.keys(data);
            for (var k = 0; k < keys.length; k++){
                agent_list[keys[k]] = data[keys[k]];

            }
          }
          // console.log(agent_list)
          var saved_state = this.state;
          saved_state.agents = agent_list;
          saved_state.edit = edit_mode.EDIT;
          this.setState(saved_state);
        });

    }
    onClickDelete(){

      this.props.selfDestruct(this.props.id);
    }
    onClickSave(){
      socket.removeAllListeners('agent update list');
      var saved_state = this.state;
      saved_state.edit = edit_mode.LOADING;
      this.setState(saved_state);

      // update json
      var obj = this.makeJsonObj();

      this.props.saveJsonObj(obj, this.props.id);
      this.updateAgent(this.props.jsonObj.agent);
      saved_state = this.state;
      saved_state.edit = edit_mode.DEFAULT;
      this.setState(saved_state);
    }

    onClickCancel(){
      // this.updateAgent(this.props.jsonObj.agent);
      socket.removeAllListeners('agent update list');
      var saved_state = this.state;
      saved_state.edit = edit_mode.LOADING;
      this.setState(saved_state);
      this.updateAgent(this.props.jsonObj.agent);
      var saved_state = this.state;
      saved_state.edit = edit_mode.DEFAULT;
      this.setState(saved_state);
      // socket.removeAllListeners('agent update list');
    }

    handleAgentChange(value){
      // console.log("agent changed ", value);
        if(this.state.edit===edit_mode.EDIT) {
          this.updateAgent(String(value));
        }
        // console.log(this.state);
    }
    handleDataChange(value){

      if(this.state.edit===edit_mode.EDIT) {
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
      selected_agent= (this.state.agent_status === agent_status.NONE) ? []: this.state.agent_selection;


      var cPlot;
      switch(this.state.agent_status){
        case agent_status.ACTIVE:
          if(this.state.data_selection.length > 0){
            cPlot = <CosmosPlot data_selected={this.state.data_selection} agent ={selected_agent}/>;
          }
          else {
            cPlot = <h4>No valid data to plot </h4>;
          }
          selected_agent = this.state.agent_selection;
        break;
        case agent_status.INACTIVE:
            cPlot = <h3> No LIVE data from agent: {this.state.agent_selection}</h3>;
            selected_agent = this.state.agent_selection;
        break;
        default:
            cPlot = <div>Listening for agent {this.state.agent_selection}<Icon type="loading"/></div>;
            selected_agent = [];
        break;
      }
      var buttons;
      switch(this.state.edit){
        case edit_mode.EDIT:
          buttons = <Button.Group>
                      <Button type='default'  onClick={this.onClickSave.bind(this)}><Icon type="check"/></Button>
                      <Button type='danger' onClick={this.onClickCancel.bind(this)}><Icon type="close" /></Button>
                    </Button.Group>;
        break;
        case edit_mode.LOADING:
          buttons = <Button type='default'><Icon type="loading"/></Button>;
        break;
        default:
          if(this.state.agent_status === agent_status.NONE){
            buttons = <Button type='default'><Icon type="loading"/></Button>;
          }
          else {
            buttons = <Button.Group>
                        <Button type='default' onClick={this.onClickEdit.bind(this)}><Icon type="edit" /></Button>
                        <Button type='danger' onClick={this.onClickDelete.bind(this)}><Icon type="delete" /></Button>
                      </Button.Group>;
          }
        break;
      }


      if(this.state.edit===edit_mode.EDIT){
        return (

          <div>

            <Select
              mode="single"
              style={{ width: '400px' }}
              placeholder="Select Agent"
              onChange={this.handleAgentChange.bind(this)}
              value = {selected_agent}
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
            {buttons}
            {cPlot}
          </div>


        );
      }
      else {
        return (

          <div>

            <Select
              mode="single"
              style={{ width: '400px' }}
              placeholder="Select Agent"
              onChange={this.handleAgentChange.bind(this)}
              value = {selected_agent}
              disabled
            >
            {agent_names}
            </Select>
            <Select
              value = {selected_data}
              mode="multiple"
              style={{ width: '400px' }}
              placeholder="Select Data to Plot"
              onChange={this.handleDataChange.bind(this)}
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

}

export default CosmosAgentJson;
