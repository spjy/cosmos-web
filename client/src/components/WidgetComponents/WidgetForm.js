import React, { Component } from 'react';
import {
  Form, Select, Badge, TreeSelect, Alert, Input
} from 'antd';
import io from 'socket.io-client';
import cosmosInfo from './../Cosmos/CosmosInfo';
import { plot_form_datalist } from './../Cosmos/Libs';
import { setup_agent } from './../Cosmos/CosmosPlotLibs';
import CosmosAgent from './CosmosAgent';
import { widgetType } from './Widget';

const socket = io(cosmosInfo.socket);
const {Option} = Select;

class WidgetForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      agent_list: [],
      data_list: [],
      command_list: []
    };
  }

  componentDidMount() {
    fetch(`${cosmosInfo.socket}/api/agent_list`)
      .then(response => response.json())
      .then((data) => {
        this.setState({ agent_list: data.result });
      });

    socket.on('agent update list', (data) => { // subscribe to agent
      if (data) {
        const agents = this.state.agent_list;
        for (let i = 0; i < agents.length; i++) {
          if (data[agents[i].agent_proc]) {
            agents[i].live = true;
          } else {
            agents[i].live = false;
          }
        }
        this.setState({ agent_list: agents });
      }
    });
    
    if (this.props.info.agent !== '') {
      let agent_name = this.props.info.agent;
      if (this.props.info.widget_type === widgetType.COSMOS_DATA
        || this.props.info.widget_type === widgetType.LIVE_PLOT
        || this.props.info.widget_type === widgetType.ARCHIVE_PLOT
      ) {
        let structure = this.props.structure(agent_name);
        // console.log(structure)
        if (structure) {
          let tree_data = plot_form_datalist(structure);
          this.setState({ data_list: tree_data });
        } else {
          let new_agent = new CosmosAgent({ agent: agent_name });
          setup_agent(new_agent).then((result) => {
            let tree_data = plot_form_datalist(new_agent.structure);
            this.setState({ data_list: tree_data });
            // console.log(":")
            this.props.newAgent(new_agent);
            // console.log("setup agent", new_agent.agent)
          });
        }
      }
    }
  }

  componentWillUnmount() {
    socket.removeAllListeners('agent update list');
  }

  agentSelected(value) {
    let agent_name = this.state.agent_list[value].agent_proc;
    let node_name = this.state.agent_list[value].agent_node;
    // console.log(node_name);
    this.props.updateForm({ key: 'agent', value: agent_name });
    this.props.updateForm({ key: 'node', value: node_name });
    if (this.props.info.widget_type === widgetType.COSMOS_DATA
      || this.props.info.widget_type === widgetType.LIVE_PLOT
      || this.props.info.widget_type === widgetType.ARCHIVE_PLOT
    ) {
      let structure = this.props.structure(agent_name);
      // console.log(structure)
      if (structure) {
        let tree_data = plot_form_datalist(structure);
        this.setState({ data_list: tree_data });
      } else {
        // console.log("no structure ")
        let new_agent = new CosmosAgent({ agent: agent_name });
        setup_agent(new_agent).then((result) => {
          let tree_data = plot_form_datalist(new_agent.structure);
          this.setState({ data_list: tree_data });
          // console.log(":")
          this.props.newAgent(new_agent);
          // console.log("setup agent", new_agent.agent)
        });
      }
    } else if (this.props.info.widget_type === widgetType.AGENT_COMMAND) {
      // get command list
      this.setState({ loading_commands: true, command_list: [] });
      // var nodename = this.state.agent_list[value].agent_node;
      // console.log("node", nodename)
      this.props.setNode(node_name);
      socket.emit('list_agent_commands', { agent: agent_name, node: node_name }, this.getAgentCommandsList.bind(this));
    }
  }

  getAgentCommandsList(data) {
    // console.log(data)
    this.setState({ command_list: data.command_list, loading_commands: false });
  }

  dataSelected(value) {
    this.props.updateForm({ key: 'data_name', value });
  }

  handleFieldChange(event) {
    this.props.updateForm({ key: event.target.id, value: event.target.value });
  }

  selectWidgetType(value) {
    this.props.updateForm({ key: 'widget_type', value });
  }

  commandSelected(val) {
    console.log('command', val);
    this.props.updateForm({ key: 'command0', value: val });
  }

  getCommandDetail(command_str) {
    let cmd;
    for (let i = 0; i < this.state.command_list.length; i++) {
      cmd = this.state.command_list[i];
      if (cmd.command === command_str) {
        return cmd.detail;
      }
    }
  }

  render() {
    // agent list
    const AgentOption = Select.Option;
    let agent_names = [];
    let { agent_list } = this.state;
    let badge;
    for (let i = 0; i < agent_list.length; i++) {
      badge = 'default';
      if (agent_list[i].live === true) {
        badge = 'processing';
        agent_names.push(<AgentOption key={i}>
          <Badge status={badge} /> 
          {' '}
          {agent_list[i].agent_proc}
          {' '}
          </AgentOption>
        );
      } else if (this.props.info.widget_type === widgetType.ARCHIVE_PLOT) {
        badge = 'default';
        agent_names.push(<AgentOption key={i}>
          <Badge status={badge} />
          {' '}
          {agent_list[i].agent_proc}
          {' '}
          </AgentOption>
        );
      }
    }
    const form_style = {};
    let agentSelect = (
      <Form.Item label="Agent" key="agent">
        <Select
          showSearch
          value={this.props.info.agent}
          onChange={this.agentSelected.bind(this)}
          style={{minWidth: '200px'}}
        >
          {agent_names}
        </Select>
      </Form.Item>
    );


    const tree_props = {
      treeData: this.state.data_list,
      value: this.props.info.data_name,
      onChange: this.dataSelected.bind(this),
      treeCheckable: true,
      showCheckedStrategy: TreeSelect.SHOW_PARENT,
      searchPlaceholder: 'Select'
    };

    const dataSelect = (
      <Form.Item label="DataSet" key="dataname">
          <TreeSelect style={{minWidth: '300px'}} {... tree_props}>
          </TreeSelect>
      </Form.Item>
    );
    let form_items = [];
    let command_detail;
    // if(this.props.info.agent !== "" ){
    // }
    switch (this.props.info.widget_type) {
      case (widgetType.LIVE_PLOT):
        form_items.push(agentSelect);
        if (this.props.info.agent !== '') {
          form_items.push(dataSelect);
          form_items.push(<Form.Item label="Title" key="title">
            <Input
placeholder="Title"
                  id="title"
                  onChange={this.handleFieldChange.bind(this)}
                  value={this.props.info.title}
                  style={form_style} 
                />
                          </Form.Item>);
          form_items.push(<Form.Item label="X-Axis Label" key="xLabel">
            <Input
placeholder="Label"
                  id="xLabel"
                  onChange={this.handleFieldChange.bind(this)}
                  value={this.props.info.plot_labels[0]}
                  style={form_style} 
                />
                          </Form.Item>);
          form_items.push(<Form.Item label="Y-Axis Label" key="yLabel">
            <Input
placeholder="Label"
                id="yLabel"
                onChange={this.handleFieldChange.bind(this)}
                value={this.props.info.plot_labels[1]}
                style={form_style} 
              />
          </Form.Item>);
          form_items.push(<Form.Item label="Time Range (minutes)" key="xRange">
              <Input
placeholder="Time Range (minutes)"
                  id="xRange"
                  onChange={this.handleFieldChange.bind(this)}
                  value={this.props.info.xRange}
                  style={form_style} 
                />
                            </Form.Item>);
        }

        break;
      case (widgetType.ARCHIVE_PLOT):
        form_items.push(agentSelect);
        if (this.props.info.agent !== '') {
          form_items.push(dataSelect);
          form_items.push(<Form.Item label="Title" key="title">
            <Input
placeholder="Title"
                  id="title"
                  onChange={this.handleFieldChange.bind(this)}
                  value={this.props.info.title}
                  style={form_style} 
                />
                          </Form.Item>);
          form_items.push(<Form.Item label="X-Axis Label" key="xLabel">
            <Input
placeholder="Label"
                  id="xLabel"
                  onChange={this.handleFieldChange.bind(this)}
                  value={this.props.info.plot_labels[0]}
                  style={form_style} 
                />
                          </Form.Item>);
          form_items.push(<Form.Item label="Y-Axis Label" key="yLabel">
            <Input
placeholder="Label"
                id="yLabel"
                onChange={this.handleFieldChange.bind(this)}
                value={this.props.info.plot_labels[1]}
                style={form_style} 
              />
                          </Form.Item>);
          form_items.push(<Form.Item label="Time Range (minutes)" key="xRange">
              <Input
placeholder="Time Range (minutes)"
                  id="xRange"
                  onChange={this.handleFieldChange.bind(this)}
                  value={this.props.info.xRange}
                  style={form_style} 
                />
            </Form.Item>);
        }

        break;
      case (widgetType.COSMOS_DATA):
        form_items.push(agentSelect);
        if (this.props.info.agent !== '') {
          form_items.push(dataSelect);
        }
        break;
      case (widgetType.AGENT_COMMAND):
        var command_list = [];
        form_items.push(agentSelect);
        if (this.props.info.agent !== '') {
          form_items.push(<Form.Item label="Command Label" key="title">
            <Input
placeholder="Command Label"
                  id="title"
                  onChange={this.handleFieldChange.bind(this)}
                  value={this.props.info.title}
                  style={form_style} 
                />
                          </Form.Item>);
          for (let j = 0; j < this.state.command_list.length; j++) {
            command_list.push(<Option key={j} value={this.state.command_list[j].command}> 
{' '}
{this.state.command_list[j].command}
{' '}
 </Option>);
          }

          form_items.push(<Form.Item label="Command" key="command">
            <Select
                          showSearch
                          id="command0"
                          value={this.props.info.command[0]}
                          onChange={this.commandSelected.bind(this)}
                          style={{ minWidth: '200px' }}
                        >
                          {command_list}
                        </Select>
                          </Form.Item>);
          if (this.props.info.command[0] !== '') {
            command_detail = <p style={{ whiteSpace: 'pre-wrap' }}> 
{' '}
<b>Command Detail: <br/></b>
{this.getCommandDetail(this.props.info.command[0])}
{' '}
 </p>;
            form_items.push(<Form.Item label="Args" key="args">
                <Input
placeholder="args"
                    id="args"
                    onChange={this.handleFieldChange.bind(this)}
                    value={this.props.info.command[1]}
                    style={form_style} 
                  />
                              </Form.Item>);
          }
        }
        break;
      default:
        break;
    }


    return (
      <div style={{ padding: '0 1em', margin: '20px' }}>
        <Select
          onChange={this.selectWidgetType.bind(this)}
          style={{ width: 200 }}
          value={this.props.info.widget_type}
        >
          <Option value={widgetType.NONE}>Select Widget Type</Option>
          <Option value={widgetType.LIVE_PLOT}>Live Plot</Option>
          <Option value={widgetType.COSMOS_DATA}>Data Table</Option>
          <Option value={widgetType.AGENT_COMMAND}>Command</Option>
          <Option value={widgetType.AGENT_LIST}>Agent List</Option>
          <Option value={widgetType.ARCHIVE_PLOT}>Historical Plot</Option>
          <Option value={widgetType.ORBIT}>Orbit</Option>
        </Select>
        <Form layout="inline">
          {form_items}
          {command_detail}
        </Form>

      </div>
    );
  }
}

export default WidgetForm;
