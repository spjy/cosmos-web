import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Select, Button } from 'antd';

import BaseComponent from '../BaseComponent';

function DisplayValue() {
  /** Storage for form values */
  const [form, setForm] = useState({});
  /** Status of the live switch */
  const [liveSwitch, setLiveSwitch] = useState();
  /** Agents */
  const [agentList, setAgentList] = useState([]);
  /** Selected agent to get requests from */
  const [selectedAgent, setSelectedAgent] = useState([]);

  /** Watches for changes to selectedAgent. Then sends WS message to get list of commands. */
  useEffect(() => {
    const ws = new WebSocket(`ws://${process.env.REACT_APP_WEBSOCKET_IP}:8080/command/`);

    if (selectedAgent.length > 0) {
      ws.send(`${selectedAgent[0]} ${selectedAgent[1]}`);
    }
  }, [selectedAgent]);

  /** Requests possible from selectedAgent */
  const [agentRequests, setAgentRequests] = useState([]);
  /** Selected agent request */
  const [selectedRequest, setSelectedRequest] = useState('> agent');
  /** Agent command arguments */
  const [commandArguments, setCommandArguments] = useState('');
  /** Agent command history (to display in the terminal) */
  const [commandHistory, setCommandHistory] = useState([]);

  const wsCommand = new WebSocket(`ws://${process.env.REACT_APP_WEBSOCKET_IP}:${process.env.REACT_APP_QUERY_WEBSOCKET_PORT}/command/`);

  /** Manages requests for agent list and agent [node] [process] */
  wsCommand.onmessage = ({ data }) => {
    let json;

    try {
      json = JSON.parse(data);
    } catch (err) {
      console.log(err);
    }

    console.log(data);

    if (json && json.agent_list) {
      // agent list
      setAgentList(json.agent_list);
    } else if (json && json.request_output && json.request_out.response) {
      // agent node proc
      setAgentRequests(json.request_output.response.requests);
    } else if (json && json.request_output) {
      // agent node proc cmd

    }
  };

  /** On mount get list of agents */
  useEffect(() => {
    wsCommand.onopen = () => {
      wsCommand.send('list');
    };

    console.log(agentList);
  }, []);

  /** Handle submission of agent command */
  const sendCommand = () => {
    const ws = new WebSocket(`ws://${process.env.REACT_APP_WEBSOCKET_IP}:${process.env.REACT_APP_QUERY_WEBSOCKET_PORT}/command/`);

    if (selectedRequest === '> agent') {
      ws.send(commandArguments);
      setCommandHistory([...setCommandHistory, `agent ${commandArguments}`])
    } else {
      ws.send(`${agentRequests[0]} ${agentRequests[1]} ${selectedRequest} ${commandArguments}`);
      setCommandHistory([...setCommandHistory, `agent ${agentRequests[0]} ${agentRequests[1]} ${selectedRequest} ${commandArguments}`])
    }
  };

  return (
    <BaseComponent
      name="Agent Commands"
      subheader=""
      liveOnly
      showStatus={false}
    >
      <Select
        className="w-full mb-2"
        dropdownMatchSelectWidth={false}
        onChange={value => setSelectedAgent(value.split(':'))}
        placeholder="Select agent node and process"
      >
        {
          agentList.map(({ agent_node, agent_proc }) => {
            return (
              <Select.Option
                key={`${agent_node}:${agent_proc}`}
                value={`${agent_node}_${agent_proc}`}
              >
                {agent_node}: {agent_proc}
              </Select.Option>
            );
          })
        }
      </Select>
      <div className="border border-gray-300 rounded mb-2 p-4 bg-white font-mono h-32 max-h-full resize-y overflow-y-scroll">
        {
          commandHistory.map((command, i) => (<div key={i}>{ command }</div>))
        }
      </div>
      <div className="flex">
        <Input
          addonBefore={(
            <Select
              className="w-auto"
              defaultValue="> agent"
              dropdownMatchSelectWidth={false}
              onChange={value => setSelectedRequest(value)}
            >
              <Select.Option value="> agent">➜ agent</Select.Option>
              {
                agentRequests.map(({ token, synopsis, description }) => {
                  return (
                    <Select.Option value={token} key={token}>{ token }</Select.Option>
                  );
                })
              }
              <Select.Option value="help">help</Select.Option>
              <Select.Option value="shutdown">shutdown</Select.Option>
              <Select.Option value="diskFreePercent">diskFreePercent</Select.Option>
              <Select.Option value="getvalue">getvalue</Select.Option>
            </Select>
          )}
          addonAfter={(
            <div
              className="cursor-pointer text-blue-600 hover:text-blue-400"
              onClick={() => sendCommand()}
            >
              Send
            </div>
          )}
          placeholder="Arguments"
          onChange={value => setCommandArguments(value)}
          onPressEnter={() => sendCommand()}
        />
      </div>
    </BaseComponent>
  );
}

DisplayValue.propTypes = {};

DisplayValue.defaultProps = {};

export default DisplayValue;
