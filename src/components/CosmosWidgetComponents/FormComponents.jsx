/* global fetch:false */
import React, { Component } from 'react';
import {
  Form, Select, TreeSelect, Badge
} from 'antd';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import cosmosInfo from '../Cosmos/CosmosInfo';

const socket = io(cosmosInfo.socket);
const { Option } = Select;

export class AgentSelect extends Component {
  /*  This component renders the Form Input for selecting an agent
  */
  constructor(props) {
    super(props);
    this.state = {
      agents: []
    };
  }

  componentDidMount() { // called as component is rendered
    /* get list of all agents in database, save to state.agents */
    fetch(`${cosmosInfo.socket}/api/agent_list`)
      .then(response => response.json())
      .then((data) => {
        this.setState({ agents: data.result });
        // console.log(data.result)
        if (typeof this.props.onMount === 'function') {
          const agent = data.result.find(o => o.agent_proc === this.props.agent);
          if (agent) {
            this.props.onMount({ agent });
          }
        }
      });

    socket.on('agent update list', (data) => { // subscribe to agent list
      if (data) {
        this.setState((prevState) => {
          const { agents } = prevState;
          for (let i = 0; i < agents.length; i += 1) {
            if (data[agents[i].agent_proc]) {
              agents[i].live = true;
            } else {
              agents[i].live = false;
            }
          }
          return { agents };
        });
      }
    });
  }

  componentWillUnmount() {
    socket.removeAllListeners('agent update list');
  }

  onChange = (val) => {
    // console.log("agent changed", val)
    this.props.onChange({ agent: this.state.agents[val] });
  }

  render() {
    const AgentOption = Select.Option;
    const agentOptions = [];
    let badge;
    for (let i = 0; i < this.state.agents.length; i += 1) {
      badge = 'default';
      if (this.state.agents[i].live === true) {
        badge = 'processing';
        agentOptions.push(
          <AgentOption key={i}>
            <Badge status={badge} />
            {this.state.agents[i].agent_proc}
          </AgentOption>
        );
      } else {
        badge = 'default';
        agentOptions.push(
          <AgentOption key={i}>
            <Badge status={badge} />
            {this.state.agents[i].agent_proc}
          </AgentOption>
        );
      }
    }
    return (
      <Form.Item label="Agent" key="agent">
        <Select
          showSearch
          value={this.props.agent}
          onChange={this.onChange}
          style={{ minWidth: '200px' }}
        >
          {agentOptions}
        </Select>
      </Form.Item>
    );
  }
}

AgentSelect.propTypes = {
  agent: PropTypes.string.isRequired, // selected agent
  onChange: PropTypes.func.isRequired, // function to call when value is changed args: {}
  onMount: PropTypes.func.isRequired // function called when constructed with a value
};

function find(map, str) {
  return map.findIndex(x => x.title === str);
}

function tree(jsonStruc) {
  const treeData = [];
  for (let i = 0; i < jsonStruc.length; i += 1) {
    const entry = jsonStruc[i];
    let parent = treeData;
    let title = '';
    for (let j = 0; j < entry.length; j += 1) {
      let index;
      let cIndex;

      if (j === 0) { // first level, find in treeData
        title = entry[j];
        // index = treeData.findIndex(x => x.title === title);
        index = find(treeData, title);
        if (index >= 0) { // found at first level
          // set parent as treeData[index]
          parent = treeData[index];
        } else if (j === entry.length - 1) { // add to treeData without chidlren []
          treeData.push({
            title,
            value: title,
            key: title
          });
          parent = null;
        } else { // add to treeData with children , set added entry as parent
          cIndex = treeData.push({
            title,
            value: title,
            key: title,
            children: []
          });
          parent = treeData[cIndex - 1];
        }
      } else { // find in parent.children
        title += `_${entry[j]}`;
        index = find(parent.children, title);
        if (index >= 0) { // found, set parent as parent.children[index]
          parent = parent.children[index];
        } else if (j === entry.length - 1) { // add to parent.children without chidlren []
          parent.children.push({
            title,
            value: title,
            key: title
          });
          parent = null;
        } else { // add to parent.children with children , set added entry as parent
          cIndex = parent.children.push({
            title,
            value: title,
            key: title,

            children: []
          });
          parent = parent.children[cIndex - 1];
        }
      }
    }
  }
  return treeData;
}

export function DataNameSelect(props) {
  /*  This component renders the Form Input for selecting a datanames specific to an agent
  * props = {
  *  allNames (array),
  *  value (array) [values selected]
  *  onChange (function) called when selection changes
  * }
  */
  const jsonNames = tree(props.structure);
  const treeProps = {
    treeData: jsonNames,
    value: props.value,
    onChange: props.onChange,
    treeCheckable: true,
    showCheckedStrategy: TreeSelect.SHOW_PARENT,
    searchPlaceholder: 'Select'
  };
  return (
    <Form.Item label="DataSet" key="dataname">
      <TreeSelect style={{ minWidth: '300px' }} {... treeProps} />
    </Form.Item>

  );
}
DataNameSelect.propTypes = {
  structure: PropTypes.arrayOf(PropTypes.array).isRequired,
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired
};


export function AgentCommandSelect(props) {
  /*  This component renders the Form Input for selecting a requests specific to an agent
  */
  const commandList = [];
  for (let j = 0; j < props.commandList.length; j += 1) {
    commandList.push(
      <Option key={j} value={props.commandList[j].command}>
        {props.commandList[j].command}
      </Option>
    );
  }
  return (
    <Form.Item label="Command" key="command">
      <Select
        showSearch
        id="command0"
        value={props.commandSelected}
        onChange={props.onChange}
        style={{ minWidth: '200px' }}
      >
        {commandList}
      </Select>
    </Form.Item>
  );
}
//
AgentCommandSelect.propTypes = {
  onChange: PropTypes.func.isRequired,
  commandList: PropTypes.arrayOf(PropTypes.object).isRequired,
  commandSelected: PropTypes.string.isRequired
};
