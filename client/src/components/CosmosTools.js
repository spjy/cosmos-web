import React, { Component } from 'react';
import Navbar from './Global/Navbar';
import {  Card , Button , Modal , Icon , Select, Alert} from 'antd';
import io from 'socket.io-client';
import cosmosInfo from './Cosmos/CosmosInfo'
import CosmosAgent from './Cosmos/CosmosAgent'
import Widget from './Widgets/Widget'
import CosmosWidgetInfo from './Widgets/CosmosWidgetInfo'
import { parse_live_data , setup_agent } from './Cosmos/CosmosPlotLibs'
const socket = io(cosmosInfo.socket);



class CosmosTools extends Component {
  constructor(props){
    super(props);
      this.state = {
        agents: {},
        widgets: []
      };


  }
  componentDidMount() {

  }
  componentWillUnmount(){
    var agents = Object.keys(this.state.agents);
    for(var i=0; i< agents.length; i++){
      socket.removeAllListeners('agent subscribe '+agents[i]);
      socket.emit('end record', agents[i]);
    }
  }

  onClickAddWidget(){
    var widgets = this.state.widgets;
    var w = new CosmosWidgetInfo({})
    widgets.push(w)
    this.setState({widgets:widgets})

  }

  startListening(agentname){
    socket.emit('start record', agentname);
    socket.on('agent subscribe '+agentname, (data) => { // subscribe to agent
      if (data) {
        // console.log("subscribe", data)
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
  updateWidget(e){
    var widgets = this.state.widgets;
    widgets[e.id]=e.form;
    var agent= this.state.agents[e.form.agent];
    // console.log("agent",e.form.data_name)
    widgets[e.id].values=agent.info.get_data_structure(e.form.data_name);
    console.log("update widget" ,widgets)
    this.setState ({widgets:widgets})
    this.startListening(e.form.agent);

  }
  removeWidget(index){
    var widgets = this.state.widgets;
    console.log("remove",widgets[index])
    widgets.splice(index,1);
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
    // console.log(agent_name)
    this.setState({agents:agent_list});
    // console.log("adding new agent")
  }

  render() {
    // console.log("Tools:Agents", this.state.agents)
    var widget=[];
    var data={};
    for(var i=0; i<this.state.widgets.length; i++){
      if(this.state.agents[this.state.widgets[i].agent]) {
        data =this.state.agents[this.state.widgets[i].agent].data
        // console.log("data", data)
        // console.log("widget", this.state.widgets[i])
      }
      widget.push(<Widget key={i} id={i}
        info={this.state.widgets[i]}
        data={data}
        newAgent={this.newAgent.bind(this)}
        updateWidget={this.updateWidget.bind(this)}
        selfDestruct={this.removeWidget.bind(this)}
        agentStructure ={this.agentStructure.bind(this)}/>)
    }
    return (

      <div>
        <Navbar current="cosmostools" />
        <div >
          <Card size="small" style={{ width: '100%' }} >
            {widget}
          <Button type="default" onClick={this.onClickAddWidget.bind(this)}><Icon type="plus"/> Add Widget </Button>
          </Card>

          </div>
      </div>


    );



  }

}

export default CosmosTools;
