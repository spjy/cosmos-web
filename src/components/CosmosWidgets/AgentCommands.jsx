import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Alert, Select, Option, Button, Input } from 'antd';
import io from 'socket.io-client';

import { AgentSelect, DataNameSelect } from '../CosmosWidgetComponents/FormComponents';
import CosmosWidget from '../CosmosWidgetComponents/CosmosWidget';

import cosmosInfo from '../Cosmos/CosmosInfo';
const socket = io(cosmosInfo.socket);

/*
Forms

1. Can select agent node and name. Drop down for available agents. If has 'add_request' commands, have them here
2. Get the list of add_request commands
3. Loop through them and be able to add buttons for them.


*/

class AgentCommands extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show_form: false,
      form: {},
      form_valid: true,
      commandList: [],
      loadingCommands: false,
      data: ''
    };
  }

  onOK = () => {
    const valid = true;
    // do form validation here
    if (valid) {
      this.props.updateInfo(this.props.id, this.state.form);
      this.closeForm();
    }
  }

  openForm = () => {
    this.setState({ show_form: true });
  }

  closeForm = () => {
    this.setState({ show_form: false });
  }

  onCancel = () => {
    const form = this.props.info; // reset form values without saving
    this.setState({ form });
    this.closeForm();
  }

  selectAgent = (value) => {
    const agentName = value.agent.agent_proc;
    const nodeName = value.agent.agent_node;
    const { structure } = value.agent;
    const { form } = this.state;

    if (form.agent !== agentName && form.agent !== '') { // empty dataset selected if agent changes
      form.data_name = [];
    }
    if (agentName !== this.props.info.agent && form.agent === this.props.info.agent) {
      this.setState(prevState => ({ prevJsonStructure: prevState.jsonStructure }));
    }
    form.agent = agentName;
    form.node = nodeName;

    socket.emit('list_agent_commands', {
        agent: agentName, node: nodeName
    }, this.getAgentCommandsList.bind(this));

    console.log(agentName, nodeName)

    this.setState({ form, jsonStructure: structure, loadingCommands: true });
  }

  getAgentCommandsList(data) {
    // console.log(data)
    this.setState({ commandList: data.command_list, loadingCommands: false });
    console.log(data.command_list)
  }

  handleCommandChange(command, value) {
    socket.emit('agent_command',
      { agent: this.props.info.agent, node: this.props.info.node, command: `${command} ${value.join(' ')}` },
      this.commandResponseReceived.bind(this));
  }

  commandResponseReceived(data) {
    this.setState({ [data.command]: <p style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{data.output}</p> });
  }

  render() {
    return (
      <CosmosWidget
        id={this.props.id}
        title="Agent Commands"
        mod={this.props.mod}
        selfDestruct={this.props.selfDestruct}
        editWidget={this.openForm}
      >
        <Modal
          visible={this.state.show_form}
          title="Widget Settings"
          onOk={this.onOK}
          onCancel={this.onCancel}
        >
          <Form layout="inline">
            <AgentSelect
              agent={this.state.form.agent}
              onMount={this.initializeAgent}
              onChange={this.selectAgent}
            />
          </Form>
          {!this.state.form_valid && <Alert message="Incomplete" type="warning" showIcon />}
        </Modal>
        Selected: [{this.props.info.node}] {this.props.info.agent}
        
        {this.state.commandList.map(({ command }, i) => (
          <div key={i}>
            <Form
              layout="inline"
              onSubmit={this.handleSubmit}
            >
              <Form.Item>
                <Select
                  mode="tags"
                  placeholder="Arguments"
                  onChange={(value) => this.handleCommandChange(command, value)}
                ></Select>
              </Form.Item>
              <Form.Item>
                <Button>{command}</Button>
              </Form.Item>
            </Form>
            {this.state[command]}
          </div>
        ))}
      </CosmosWidget>
    );
  }
}

AgentCommands.propTypes = {
  id: PropTypes.number.isRequired,
  info: PropTypes.shape({
    widgetClass: PropTypes.string.isRequired,
    agent: PropTypes.string.isRequired,
    node: PropTypes.string.isRequired,
    widgetClass: PropTypes.string.isRequired,
    request: PropTypes.string.isRequired,
    arguments: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  selfDestruct: PropTypes.func.isRequired,
  updateInfo: PropTypes.func.isRequired,
  mod: PropTypes.bool.isRequired
};

export default AgentCommands;
