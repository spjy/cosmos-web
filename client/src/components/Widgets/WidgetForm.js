import React, { Component } from 'react';
import { Form, Select, Badge, TreeSelect, Alert, Input } from 'antd';
import cosmosInfo from './../Cosmos/CosmosInfo'
import {plot_form_datalist} from './../Cosmos/Libs'
import {  setup_agent } from './../Cosmos/CosmosPlotLibs'
import CosmosAgent from './../Cosmos/CosmosAgent'
import io from 'socket.io-client';
import {widgetType} from './Widget'
const socket = io(cosmosInfo.socket);
const Option = Select.Option;

class WidgetForm extends Component {
  constructor(props){
    super(props);
      this.state = {
        agent_list:[],
        data_list:[],
        archive:false
            };


  }


  componentDidMount() {
    fetch(`${cosmosInfo.socket}/api/agent_list`)
    .then(response => response.json())
    .then(data =>
      {
        this.setState({agent_list:data.result})

      }
    );
    socket.on('agent update list', (data) => { // subscribe to agent
        if (data) {
          var agents = this.state.agent_list;
          for(var i=0; i < agents.length; i++){
              if(data[agents[i].agent_proc]) {
                agents[i].live=true;
              } else {
                agents[i].live=false;
              }
          }
          this.setState({agent_list:agents})
        }
      });
      socket.emit('agent_dates', {agent: this.props.info.agent}, this.agentArchiveFound.bind(this));
  }
  agentArchiveFound(data){
    if(data.valid===true)
      this.setState({archive:true})
  }

  componentWillUnmount() {
    socket.removeAllListeners('agent update list');
  }

  agentSelected(value) {

    var agent_name = this.state.agent_list[value].agent_proc
    this.props.updateForm({key:"agent", value: agent_name});
    var structure = this.props.structure(agent_name);
    if(structure){
        var tree_data = plot_form_datalist(structure);
        this.setState({data_list:tree_data})
    }
    else {
       var new_agent = new CosmosAgent({agent:agent_name});
      setup_agent(new_agent).then((result)=>{
        var tree_data = plot_form_datalist(new_agent.structure);
        this.setState({data_list:tree_data})
        // console.log(":")
        this.props.newAgent(new_agent);
        // console.log("setup agent", new_agent.agent)
      });
    }


  }
  dataSelected(value) {

    console.log("dataname", value)
    this.props.updateForm({key:"data_name", value:value});
  }

  handleFieldChange(event){
    this.props.updateForm({key:event.target.id, value: event.target.value});
  }
  selectWidgetType(value){
    this.props.updateForm({key:"widget_type", value: value});
  }

render() {
    //agent list
    const AgentOption = Select.Option;
    var agent_names=[];
    var agent_list  = this.state.agent_list;
    var badge;
    for(var i =0; i < agent_list.length; i++){
      badge="default"
      if(agent_list[i].live===true) badge ="processing"
      agent_names.push(<AgentOption key={i} ><Badge status={badge} /> {agent_list[i].agent_proc} </AgentOption>);
    }
    // var tree_data =[];
    var AgentStatus;
    var agent_status_msg;


    const form_style={};
    var agentSelect= <Select
                      showSearch
                      value={this.props.info.agent}
                      onChange={this.agentSelected.bind(this)}
                      style={{minWidth: '200px'}}
                    >
                      {agent_names}
                    </Select>

    const tree_props = {
      treeData: this.state.data_list,
      value: this.props.info.data_name,
      onChange: this.dataSelected.bind(this),
      treeCheckable:true,
      showCheckedStrategy:TreeSelect.SHOW_PARENT,
      searchPlaceholder:'Select',
    };
    var form_items = [];
    if(this.props.info.widget_type===widgetType.LIVE_PLOT || this.props.info.widget_type===widgetType.COSMOS_DATA){
      form_items = [ <Form.Item label="Agent" key="agentname">
                  {agentSelect}
                </Form.Item>
                ,
                <Form.Item label="DataSet" key="dataname">
                    <TreeSelect style={{minWidth: '200px'}} {... tree_props}>
                    </TreeSelect>
                </Form.Item>
                ,
                <Form.Item label="Title" key="title">
                  <Input placeholder="Title"
                    id="title"
                    onChange={this.handleFieldChange.bind(this)}
                    value={this.props.info.title}
                  style={form_style}/>
                </Form.Item>
                ,
                <Form.Item label="X-Axis Label" key="xLabel">
                  <Input placeholder="Label"
                    id="xLabel"
                    onChange={this.handleFieldChange.bind(this)}
                    value={this.props.info.plot_labels[0]}
                  style={form_style}/>
                </Form.Item>
                ,
                <Form.Item label="Y-Axis Label" key="yLabel">
                  <Input placeholder="Label"
                    id="yLabel"
                    onChange={this.handleFieldChange.bind(this)}
                    value={this.props.info.plot_labels[1]}
                  style={form_style}/>
                </Form.Item> ]
    }


    return (
      <div style={{ padding: '0 1em' , margin: '20px' }}>
            <Select onChange={this.selectWidgetType.bind(this)}
                style={{ width: 200 }}
                value={this.props.info.widget_type}>
              <Option value={widgetType.NONE}>Select Widget Type</Option>
              <Option value={widgetType.LIVE_PLOT}>Live Plot</Option>
              <Option value={widgetType.COSMOS_DATA}>Data Box</Option>
            </Select>
            <Form layout="inline" >
              {form_items}
            </Form>
            {AgentStatus}

      </div>
    );
  }

}

export default WidgetForm;
