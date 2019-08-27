import React, { useState, useEffect, useRef } from 'react';
import {
  Input, Select, Tooltip, Icon, message,
} from 'antd';

import Search from 'antd/lib/input/Search';

import { Context } from '../../../store/neutron1';
import BaseComponent from '../BaseComponent';
import socket from '../../../socket';

const ws = socket('query', '/command/');
// const live = socket('live', '/live/list');

/**
 * Send commands to agents. Simulates a CLI.
 */
const Commands = React.memo(() => {
  /** Agents */
  // const [agentList, setAgentList] = useState([]);
  /** Selected agent to get requests from */
  const [selectedAgent, setSelectedAgent] = useState([]);
  /** Requests possible from selectedAgent */
  const [agentRequests, setAgentRequests] = useState([]);
  /** Selected agent request */
  const [selectedRequest, setSelectedRequest] = useState('> agent');
  /** Agent command arguments */
  const [commandArguments, setCommandArguments] = useState('');
  /** Agent command history (to display in the terminal) */
  const [commandHistory, setCommandHistory] = useState([]);

  const cliEl = useRef(null);

  /** Manages requests for agent list and agent [node] [process] */
  ws.onmessage = ({ data }) => {
    try {
      const json = JSON.parse(data);

      if (json.output && json.output.requests) {
        // agent node proc
        setAgentRequests(json.output.requests);

        message.success(`Retrieved agent requests for ${selectedAgent[0]}:${selectedAgent[1]}.`, 5);
      } else if (json && json.output) {
        // agent node proc cmd

        const jsonOutput = JSON.stringify(json.output);

        if (jsonOutput) {
          setCommandHistory([
            ...commandHistory,
            jsonOutput,
          ]);
        } else {
          setCommandHistory([
            ...commandHistory,
            json.output,
          ]);
        }

        cliEl.current.scrollTop = cliEl.current.scrollHeight;
      } else if (json.error) {
        throw new Error(json.error);
      }
    } catch (error) {
      setCommandHistory([
        ...commandHistory,
        data,
      ]);

      message.error(error.message);
    }
  };

  // live.onmessage = ({ data }) => {
  //   try {
  //     const json = JSON.parse(data);


  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  // const { state } = useContext(Context);

  // useEffect(() => {
    // if (state.list) {
    //   setAgentList(state.list.agent_list);
    // }
  // }, [state.list]);

  /** Close ws on unmount */
  useEffect(() => () => ws.close(), []);

  /** Handle submission of agent command */
  const sendCommand = () => {
    if (selectedRequest === '> agent') {
      ws.send(commandArguments);
      setCommandHistory([
        ...commandHistory,
        `➜ agent ${commandArguments}`,
      ]);
    } else {
      ws.send(`${selectedAgent[0]} ${selectedAgent[1]} ${selectedRequest} ${commandArguments}`);
      setCommandHistory([
        ...commandHistory,
        `➜ agent ${selectedAgent[0]} ${selectedAgent[1]} ${selectedRequest} ${commandArguments}`,
      ]);
    }

    cliEl.current.scrollTop = cliEl.current.scrollHeight;
  };

  /** Get the possible requests for selected agent */
  const getRequests = () => {
    if (selectedAgent.length > 0) {
      ws.send(`${selectedAgent[0]} ${selectedAgent[1]} help_json`);
    }
  };

  /** Watches for changes to selectedAgent. Then sends WS message to get list of commands. */
  useEffect(() => {
    getRequests();
  }, [selectedAgent]);

  return (
    <BaseComponent
      name="Commands"
      subheader=""
      liveOnly
      showStatus={false}
    >
      <div className="flex flex-wrap">
        {/* <div
          className="pr-1 w-1/2"
        >
          <Select
            className="block mb-2"
            dropdownMatchSelectWidth={false}
            onChange={(value) => {
              setAgentRequests([]);
              setSelectedAgent(value.split(':'));
            }}
            placeholder="Select agent node and process"
          >
            {
              agentList.map(({ agent }) => (
                <Select.Option
                  key={agent}
                  value={agent}
                >
                  {agent}
                </Select.Option>
              ))
            }
          </Select>
        </div> */}
        <div className="w-full py-2">
          <Search
            placeholder="Select node:process"
            onSearch={value => setSelectedAgent(value.split(':'))}
            enterButton={<Icon type="select" />}
          />
        </div>
      </div>
      <div
        className="border border-gray-300 rounded mb-2 p-4 bg-white font-mono h-32 max-h-full resize-y overflow-y-scroll"
        ref={cliEl}
      >
        {
          // eslint-disable-next-line
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
              <Select.Option value="> agent">
                <Tooltip placement="right" title="node process [arguments]">
                  ➜ agent
                </Tooltip>
              </Select.Option>

              {
                agentRequests.map(({ token, synopsis, description }) => (
                  <Select.Option value={token} key={token}>
                    <Tooltip placement="right" title={`${synopsis ? `${synopsis} ` : ''}${description}`}>
                      { token }
                    </Tooltip>
                  </Select.Option>
                ))
              }
            </Select>
          )}
          addonAfter={(
            <div
              className="cursor-pointer text-blue-600 hover:text-blue-400"
              onClick={() => {
                sendCommand();
                setCommandArguments('');
              }}
              onKeyDown={() => {}}
              role="button"
              tabIndex={0}
            >
              Send
            </div>
          )}
          placeholder="Arguments"
          onChange={({ target: { value } }) => setCommandArguments(value)}
          onPressEnter={() => {
            sendCommand();
            setCommandArguments('');
          }}
          value={commandArguments}
        />
      </div>
    </BaseComponent>
  );
});

export default Commands;
