import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Alert, Select, Option, Button, Input } from 'antd';
import io from 'socket.io-client';

import { AgentSelect, AgentCommandSelect } from '../CosmosWidgetComponents/FormComponents';
import CosmosWidget from '../CosmosWidgetComponents/CosmosWidget';

import cosmosInfo from '../Cosmos/CosmosInfo';
const socket = io(cosmosInfo.socket);

class AgentRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show_form: false,
      form: {
        agent: '',
        node: '',
        request: '',
        label: '',
        arguments: ['']
      },
      form_valid: true,
      commandList: [],
      loadingCommands: false,
      data: ''
    };
  }

  onOK = () => {
    let valid = true;
    // do form validation here
    if(!this.state.form.agent) valid = false;
    if(!this.state.form.label) valid = false;
    if (valid) {
      this.props.updateInfo(this.props.id, this.state.form);
      this.closeForm();
    }
  }

  openForm = () => {
    this.setState({
      show_form: true,
      form: {
        agent: this.props.info.agent,
        node: this.props.info.node,
        request: this.props.info.request,
        label: this.props.info.label,
        arguments: [this.props.info.arguments[0]]
      }
    });
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

    // console.log(agentName, nodeName)

    this.setState({ form, jsonStructure: structure, loadingCommands: true });
  }

  initializeAgent = (agent) => {
    this.selectAgent(agent);
  }
  sendRequest = () => {
    const cmd = `${this.props.info.request} ${this.props.info.arguments}`
    socket.emit('agent_command',
      { agent: this.props.info.agent, node: this.props.info.node, command: cmd },
      this.commandResponseReceived.bind(this));
  }

  handleCommandChange = (val) => {
    const { form } = this.state;
    form.request = val;
    this.setState(form);
  }

  onChange = (e) => {
    const { form } = this.state;
    console.log(e)
    if(e.target.id == "label") {
      form.label = e.target.value;
    }

    if(e.target.id == "args") {
      form.arguments = [ e.target.value ];
    }
    this.setState(form);
  }

  getAgentCommandsList(data) {
    // console.log(data)
    this.setState({ commandList: data.command_list, loadingCommands: false });
    // console.log(data.command_list)
  }

  commandResponseReceived(data) {
    this.setState({ data: <p style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{data.output}</p> });
  }

  render() {
    let title = "Agent Request";
    if (this.props.info.node && this.props.info.agent) {
      title=`[${this.props.info.node}] ${this.props.info.agent}`;
    }
    let commandDetail;
    for(let i = 0; i < this.state.commandList.length; i += 1){
      if(this.state.commandList[i].command == this.state.form.command){
        commandDetail= this.state.commandList[i].detail;
      }
    }
    return (
      <CosmosWidget
        id={this.props.id}
        title={title}
        mod={this.props.mod}
        selfDestruct={this.props.selfDestruct}
        editWidget={this.openForm}
      >
        <Modal
          visible={this.state.show_form}
          title="Agent Request Widget Settings"
          onOk={this.onOK}
          onCancel={this.onCancel}
        >
          <Form layout="inline">
            <AgentSelect
              agent={this.state.form.agent}
              onMount={this.initializeAgent}
              onChange={this.selectAgent}
            />
            <Form.Item label="Command Label" key="title">
              <Input
                placeholder="Command Label"
                id="label"
                onChange={this.onChange}
                value={this.state.form.label}
              />
            </Form.Item>
            <AgentCommandSelect
              onChange={this.handleCommandChange}
              commandList={this.state.commandList}
              commandSelected={this.state.form.request}
            />
            <Form.Item label="Args" key="args">
              <Input
                placeholder="args"
                id="args"
                onChange={this.onChange}
                value={this.state.form.arguments[0]}
              />
            </Form.Item>
          </Form>
          {commandDetail}
          {!this.state.form_valid && <Alert message="Incomplete" type="warning" showIcon />}
        </Modal>
        <Button onClick={this.sendRequest}> {this.props.info.label} </Button>
        {this.state.data}
      </CosmosWidget>
    );
  }
}

AgentRequest.propTypes = {
  id: PropTypes.number.isRequired,
  info: PropTypes.shape({
    widgetClass: PropTypes.string.isRequired,
    agent: PropTypes.string.isRequired,
    node: PropTypes.string.isRequired,
    request: PropTypes.string.isRequired,
    arguments: PropTypes.arrayOf(PropTypes.string).isRequired,
    label: PropTypes.string.isRequired
  }).isRequired,
  selfDestruct: PropTypes.func.isRequired,
  updateInfo: PropTypes.func.isRequired,
  mod: PropTypes.bool.isRequired
};

export default AgentRequest;
