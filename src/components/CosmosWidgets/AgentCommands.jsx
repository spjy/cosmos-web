import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Form, Card, Select, Option, Button, Input } from 'antd';
import io from 'socket.io-client';

import { AgentSelect, DataNameSelect } from '../CosmosWidgetComponents/FormComponents';
import CosmosWidget from '../CosmosWidgetComponents/CosmosWidget';
import WidgetSettings from '../CosmosWidgetComponents/WidgetSettings';

import cosmosInfo from '../Cosmos/CosmosInfo';
const socket = io(cosmosInfo.socket);

/**
 * Example COSMOS Web widget.
 */
function AgentCommands({
  id,
  info,
  selfDestruct,
  updateInfo,
  mod
}) {
  /** Handler for the widget settings modal */
  const [openSettings, setOpenSettings] = useState(false);
  /** Storage for form values */
  const [form, setForm] = useState({});

  const [commandArguments, setCommandArguments] = useState([]);
  /** Store agent selected */
  const [agent, setAgent] = useState('');
  /** Store node selected */
  const [node, setNode] = useState('');

  const [dataName, setDataName] = useState([]);

  const [jsonStructure, setJsonStructure] = useState({});

  const [prevJsonStructure, setPrevJsonStructure] = useState({});

  const [loadingCommands, setLoadingCommands] = useState(false);

  const [commandList, setCommandList] = useState([]);

  const [output, setOutput] = useState([]);

  return (
    <div>
      <WidgetSettings
        visible={openSettings}
        /** Closes the modal. */
        closeModal={() => setOpenSettings(false)}
        /** Handles form submission; updates fields in CosmosToolsTest.jsx and clears form. */
        submitForm={() => {
          updateInfo(id, form);
          setForm({});
        }}
        updateInfo={updateInfo}
        validForm
      >
        {/* Insert form items here */}
        <AgentSelect
          agent={agent}
          onMount={() => {}}
          onChange={(value) => {
            const { agent_proc: agentName, agent_node: nodeName, structure } = value.agent;

            if (agent !== agentName && agent !== '') { // empty dataset selected if agent changes
              setDataName([]);
            }

            if (agentName !== info.agent && agent === info.agent) {
              setPrevJsonStructure(jsonStructure);
            }

            setAgent(agentName);
            setNode(nodeName);

            socket.emit('list_agent_commands', {
              agent: agentName, node: nodeName
            }, (data) => {
              setCommandList(data.command_list);
            });

            setJsonStructure(structure);
            setLoadingCommands(true);
          }}
        />
      </WidgetSettings>

      <CosmosWidget
        id={id}
        title="Agent Commands"
        mod={mod}
        selfDestruct={selfDestruct}
        editWidget={() => setOpenSettings(true)}
      >
        [
        {node}
        ]
        &nbsp;
        {agent}

        <Row type="flex" justify="start" style={{ flexShrink: 0 }}>
          {commandList.map(({ command }, i) => (
            <Col xs={1} sm={2} md={4} lg={4} xl={4} key={i}>
              <Form
                layout="inline"
              >
                <Form.Item>
                  <Select
                    mode="tags"
                    placeholder="Arguments"
                    onChange={value => setCommandArguments({ ...commandArguments, [command]: value })}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    onClick={() => {
                      socket.emit('agent_command', {
                        agent,
                        node,
                        command: `${command}${commandArguments[command] ? ' ' + commandArguments[command].join(' ') : ''}`
                      },
                      (data) => {
                        setOutput([...output, `➜ agent ${agent} ${node} ${command} ${commandArguments[command] ? ' ' + commandArguments[command].join(' ') : ''} || ${data.output}`]);
                      });
                    }}
                  >
                    {command}
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          ))}
        </Row>

        <br />

        <Card size="small" title="Command Output" style={{ width: '100%' }}>
          {output.map((element, i) => (
            <div key={i}>{element}</div>
          ))}
        </Card>
      </CosmosWidget>
    </div>
  );
}

/*

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

  onCancel = () => {
    const form = this.props.info; // reset form values without saving
    this.setState({ form });
    this.closeForm();
  }

  getAgentCommandsList(data) {
    // console.log(data)
    this.setState({ commandList: data.command_list, loadingCommands: false });
    console.log(data.command_list);
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

    this.setState({ form, jsonStructure: structure, loadingCommands: true });
  }

  closeForm = () => {
    this.setState({ show_form: false });
  }

  openForm = () => {
    this.setState({ show_form: true });
  }

  handleCommandChange(command, value) {
    socket.emit('agent_command',
      { agent: this.props.info.agent, node: this.props.info.node, command: `${command} ${value.join(' ')}` },
      this.commandResponseReceived.bind(this));
  }

  commandResponseReceived(data) {
    console.log(data)
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
        Selected:&nbsp;
        [
        {this.props.info.node}
        ]
        &nbsp;
        {this.props.info.agent}

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
                  onChange={value => this.handleCommandChange(command, value)}
                />
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
*/

AgentCommands.propTypes = {
  id: PropTypes.number.isRequired,
  info: PropTypes.shape({
    widgetClass: PropTypes.string.isRequired,
    agent: PropTypes.string.isRequired,
    node: PropTypes.string.isRequired,
    request: PropTypes.string.isRequired,
    arguments: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  selfDestruct: PropTypes.func.isRequired,
  updateInfo: PropTypes.func.isRequired,
  mod: PropTypes.bool.isRequired
};

export default AgentCommands;
