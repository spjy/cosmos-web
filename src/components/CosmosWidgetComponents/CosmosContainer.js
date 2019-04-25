import React, { Component } from 'react';
import {  Card } from 'antd';
import PropTypes from 'prop-types';
import io from 'socket.io-client';

import CosmosAgent  from './CosmosAgent'
import { parse_live_data , setup_agent } from './../Cosmos/CosmosPlotLibs'
import CosmosWidgetInfo , { widgetType } from './CosmosWidgetInfo'

import cosmosInfo from './../Cosmos/CosmosInfo'
const socket = io(cosmosInfo.socket);


/* This component renders the entire 'Cosmos Tools'page including widgets
 - this component monitors COSMOS Agent data, and passes relevant data to each widget (does not store history, only one at a time )
*/


class CosmosContainer extends Component {
  constructor(props){
    super(props);
      this.state = {
        agents: {},
        widgets:[]
      };
  }
  componentDidMount() {
    // initiate all agents, start listening for data
    var widgets= this.props.widgets;
    for(var i = 0; i < widgets.length; i++){
      const agent_name = widgets[i].agent;
      var cosmosAgent;
      if(agent_name !== ""){
        if(this.state.agents[agent_name]){ // add json names to track
          cosmosAgent = this.state.agents[agent_name];
          widgets[i].values = cosmosAgent.info.get_data_structure(widgets[i].data_name);
          this.setState ({widgets:widgets});
          this.startListening(agent_name);
        } else {
          cosmosAgent = new CosmosAgent({agent:agent_name});
          cosmosAgent.async_setup_agent().then( function (args, result ){
            var widgets = args.widgets;
            var agent_list = this.state.agents;
            agent_list[widgets[args.i].agent]={info:cosmosAgent, data:{}};

            widgets[args.i].values=cosmosAgent.get_data_structure(widgets[args.i].data_name);
            this.setState ({widgets:widgets,agents:agent_list});
            this.startListening(agent_name);

          }.bind(this, {i:i, widgets:this.props.widgets}));


        }
      }
    }
  }
  componentWillUnmount(){
    var agents = Object.keys(this.state.agents);
    for(var i=0; i< agents.length; i++){
      socket.removeAllListeners('agent subscribe '+agents[i]);
      socket.emit('end record', agents[i]);
    }
  }
  startListening(agentname){
    socket.emit('start record', agentname);
    socket.on('agent subscribe '+agentname, (data) => { // subscribe to agent
      if (data) {
        var e;
        var agents = this.state.agents;
        if(agents[agentname].info.values.label.length>0){
          e= parse_live_data(data, agents[agentname].info.values);
          agents[agentname].data = e;
          this.setState({agents:agents});
        }
      }
    });
  }
  removeWidget(index){
    var widgets = this.state.widgets;
    widgets.splice(index.id,1);
    this.setState({widgets:widgets});
  }
  updateWidget (index, info){
    // console.log('updateWdiget', index, info)
    var widgets = this.state.widgets;
    // update agent values that need to be tracked
    var changes = Object.keys(info);
    var key;
    for(var i = 0; i < changes.length; i++){
      key = changes[i];
       widgets[index][key] = info[key];
    }
    // console.log(widgets[index])
    this.setState({widgets:widgets});
  }
  agentStructure(agent_name){
    var agents=this.state.agents;
    if(agents[agent_name]){
      return agents[agent_name].info.structure;
    }
    else {
      return;
    }
  }
  newAgent(cosmosAgent){
    // console.log("cosmostools newAgent", cosmosAgent.agent)
    var agent_list = this.state.agents;
    var agent_name = cosmosAgent.agent;
    agent_list[agent_name] = {info:cosmosAgent, data:{}};
    this.setState({agents:agent_list});
  }

  render() {
    // console.log(this.state.widgets)
    var widgets=[];
    var data={};
    var WidgetComponent;
    var widgetType;
    for(var i=0; i<this.state.widgets.length; i++){
      if(this.state.agents[this.state.widgets[i].agent]) {
        data =this.state.agents[this.state.widgets[i].agent].data
      }
      widgetType = this.state.widgets[i].widgetClass;
      WidgetComponent = this.props.imports[widgetType];
      if(WidgetComponent){
        widgets.push(
          <WidgetComponent
            key={i}
            id={i}
            info={this.state.widgets[i]}
            data={data}
            mod={this.props.mod}
            selfDestruct = {this.removeWidget.bind(this)}
            updateInfo = {this.updateWidget.bind(this)}
              />
        );
      }
    }
    return (
      <div>
        <Card size="small" style={{ width: '100%' }} >
            {widgets}
        </Card>
      </div>
    );
  }
}


CosmosContainer.propTypes = {
  widgets: PropTypes.arrayOf(PropTypes.instanceOf(CosmosWidgetInfo)).isRequired,
  imports: PropTypes.object,
  mod: PropTypes.bool.isRequired  // true: widgets can be modified
}
export default CosmosContainer;
