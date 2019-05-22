import React, { Component } from 'react';
import {  Form , Select , TreeSelect, Badge, Input } from 'antd';
import PropTypes from 'prop-types';
import io from 'socket.io-client';


import cosmosInfo from './../Cosmos/CosmosInfo'
const socket = io(cosmosInfo.socket);
const Option = Select.Option;

export class AgentSelect extends Component {
  /*  This component renders the Form Input for selecting an agent
  */
  constructor(props) {
    super(props);
      this.state = {
        agent_list:[]
        };
  }

  componentDidMount() { // called as component is rendered
    /* get list of all agents in database, save to state.agent_list */
    fetch(`${cosmosInfo.socket}/api/agent_list`)
    .then(response => response.json())
    .then(data =>
      {
        this.setState({agent_list:data.result});
        // console.log(data.result)
        if(typeof this.props.onMount === "function"){
          let agent = data.result.find(o=> o.agent_proc=== this.props.agent);
          if(agent){
            this.props.onMount({agent:agent});
          }
          // else console.log("noagent", this.props.agent)
        }
        // else console.log("nofunc")
      }
    );
    socket.on('agent update list', (data) => { // subscribe to agent list
        if (data) {
          var agents = this.state.agent_list;
          for(var i=0; i < agents.length; i++){
              if(data[agents[i].agent_proc]) {
                agents[i].live=true;
              } else {
                agents[i].live=false;
              }
          }
          this.setState({agent_list:agents});
        }

      });
  }

  componentWillUnmount() {
    socket.removeAllListeners('agent update list');
  }

  onChange(val) {
    console.log('agent changed', val);
    this.props.onChange({
      agent: this.state.agent_list[val]
    });
  }

  render() {
    const AgentOption = Select.Option;
    var agentOptions = [];
    var badge;
    for (var i = 0; i < this.state.agent_list.length; i++) {
      badge = 'default';
      if (this.state.agent_list[i].live === true) {
        badge = 'processing';
        agentOptions.push(<AgentOption key={i} ><Badge status={badge} /> {this.state.agent_list[i].agent_proc} </AgentOption>);
      } else {
        badge = 'default';
        agentOptions.push(<AgentOption key={i} ><Badge status={badge} /> {this.state.agent_list[i].agent_proc} </AgentOption>);
      }
    }

    return (
      <Form.Item label="Agent" key="agent">
        <Select
          showSearch
          value={this.props.agent}
          onChange={this.onChange.bind(this)}
          style={{minWidth: '200px'}}
        >
          {agentOptions}
        </Select>
      </Form.Item>
    );
  }
}
AgentSelect.propTypes = {
  agent: PropTypes.string,                // selected agent
  onChange: PropTypes.func.isRequired,    // function to call when value is changed args: {}
  onMount: PropTypes.func                 // function called when constructed with a value rather than empty
}
export class DataNameSelect extends Component {
  /*  This component renders the Form Input for selecting a datanames specific to an agent
  */
  render() {
    const tree_props = {
      treeData: this.props.allNames,
      value: this.props.value,
      onChange: this.props.onChange,
      treeCheckable:true,
      showCheckedStrategy:TreeSelect.SHOW_PARENT,
      searchPlaceholder:'Select',
    };
    return (
        <Form.Item label="DataSet" key="dataname">
          <TreeSelect style={{minWidth: '300px'}} {... tree_props}></TreeSelect>
        </Form.Item>

    );
  }
}

DataNameSelect.propTypes = {
  allNames: PropTypes.array.isRequired, // list of all names to display as options
  value: PropTypes.array, // selected value to show as 'checked'
  onChange: PropTypes.func.isRequired, // function called when selection changes
};

class AgentCommandSelect extends Component {
  /*  This component renders the Form Input for selecting a datanames specific to an agent
  */

  render() {
    const form_style = {};
    var command_list = [];
    for (var j = 0; j < this.state.command_list.length; j++) {
      command_list.push(<Option key={j} value={this.props.commandList[j].command}> {this.props.commandList[j].command} </Option>);
    }
    return([
      <Form.Item label="Command Label" key="title">
            <Input placeholder="Command Label"
              id="title"
              onChange={this.props.onChange}
              value={this.props.cmdLabel}
            style={form_style}/>
        </Form.Item>,
        <Form.Item label="Command" key="command">
          <Select
              showSearch
              id="command0"
              value={this.props.cmd0}
              onChange={this.onChange}
              style={{minWidth: '200px'}}
            >
              {command_list}
          </Select>
        </Form.Item>,
        <Form.Item label="Args" key="args">
            <Input placeholder="args"
              id="args"
              onChange={this.props.onChange}
              value={this.props.cmd1}
            style={form_style}/>
        </Form.Item>]
    );
    // { this.props.cmd0 !== '' &&
    //       <p style={{whiteSpace:'pre-wrap'}}>
    //       <b>Command Detail: <br/></b>
    //       {this.props.cmdDetail} </p>}]
  }
}

AgentCommandSelect.propTypes = {
  onChange: PropTypes.func.isRequired,
  cmdLabel: PropTypes.string.isRequired,
  commandList: PropTypes.array.isRequired,
  cmd0: PropTypes.string.isRequired,
  cmd1: PropTypes.string.isRequired,
  cmdDetail: PropTypes.string
};
