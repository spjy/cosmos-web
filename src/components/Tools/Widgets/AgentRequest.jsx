import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Button, Input, Spin, Icon
} from 'antd';
import io from 'socket.io-client';

import { AgentSelect, AgentCommandSelect } from '../WidgetComponents/FormComponents';
import CosmosWidget from '../WidgetComponents/CosmosWidget';
import WidgetSettings from '../WidgetComponents/WidgetSettings';

import cosmosInfo from '../../Cosmos/CosmosInfo';

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
      validForm: true,
      commandList: [],
      data: '',
      loadingCommands: false,
      waitingForRequest: false
    };
  }

  componentDidMount() {
    /* Open form if no agent is selected */
    if (this.props.info.agent === '') this.setState({ show_form: true });
  }

  getAgentCommandsList(data) {
    // console.log(data)
    this.setState({ commandList: data.command_list, loadingCommands: false });
    // console.log(data.command_list)
  }

  sumbitForm = () => {
    let valid = true;
    // do form validation here
    if (!this.state.form.agent) valid = false;
    if (!this.state.form.label) valid = false;
    if (valid) {
      this.props.updateInfo(this.props.id, this.state.form);
      this.closeForm();
    }
    this.setState({ validForm: valid });
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
    const { form } = this.state;
    // console.log(agentName, nodeName);
    if (agentName !== this.props.info.agent && form.agent === this.props.info.agent) {
      // console.log(agentName, nodeName);
      socket.emit('list_agent_commands', {
        agent: agentName, node: nodeName
      }, this.getAgentCommandsList.bind(this));
      form.request = '';
    }
    form.agent = agentName;
    form.node = nodeName;
    this.setState({ form, loadingCommands: true });
  }

  initializeAgent = (agent) => {
    this.selectAgent(agent);
  }

  sendRequest = () => {
    const cmd = `${this.props.info.request} ${this.props.info.arguments}`;
    socket.emit('agent_command',
      { agent: this.props.info.agent, node: this.props.info.node, command: cmd },
      this.commandResponseReceived.bind(this));
    this.setState({ waitingForRequest: true });
  }

  handleCommandChange = (val) => {
    const { form } = this.state;
    form.request = val;
    this.setState(form);
  }

  clearOutput = () => {
    this.setState({ data: '' });
  }

  onChange = (e) => {
    const { form } = this.state;
    // console.log(e)
    if (e.target.id === 'label') {
      form.label = e.target.value;
    }

    if (e.target.id === 'args') {
      form.arguments = [e.target.value];
    }
    this.setState(form);
  }

  commandResponseReceived(data) {
    this.setState({ data: data.output, waitingForRequest: false });
  }

  render() {
    let title = 'Agent Request';
    if (this.props.info.node && this.props.info.agent) {
      title = `[${this.props.info.node}] ${this.props.info.agent}`;
    }
    let commandDetail;
    for (let i = 0; i < this.state.commandList.length; i += 1) {
      if (this.state.commandList[i].command === this.state.form.command) {
        commandDetail = this.state.commandList[i].detail;
      }
    }
    return (
      <CosmosWidget
        id={this.props.id}
        title={title}
        mod={this.props.mod}
        selfDestruct={this.props.selfDestruct}
        editWidget={this.openForm}
        min={this.props.min}
      >
        <WidgetSettings
          visible={this.state.show_form}
          validForm={this.state.validForm}
          closeModal={this.closeForm}
          submitForm={this.sumbitForm}
        >
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
          {this.state.loadingCommands && <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />} />}
          {!this.state.loadingCommands
            && (
              <AgentCommandSelect
                onChange={this.handleCommandChange}
                commandList={this.state.commandList}
                commandSelected={this.state.form.request}
              />
            )
          }
          <Form.Item label="Args" key="args">
            <Input
              placeholder="args"
              id="args"
              onChange={this.onChange}
              value={this.state.form.arguments[0]}
            />
          </Form.Item>
          {commandDetail}
        </WidgetSettings>
        <Button onClick={this.sendRequest}>
          {this.props.info.label}
        </Button>
        {this.state.waitingForRequest && <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />} />}
        <p style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{this.state.data}</p>
        {this.state.data.length > 0
          && <Button onClick={this.clearOutput}>Clear</Button>
        }
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
  mod: PropTypes.bool.isRequired,
  min: PropTypes.bool
};

AgentRequest.defaultProps = {
  min: false
};

export default AgentRequest;

export function DefaultAgentRequest() {
  return {
    widgetClass: 'AgentRequest',
    agent: '',
    node: '',
    arguments: [],
    label: '',
    request: ''
  };
}
