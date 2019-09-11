import React, { useState, useEffect, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Input, Select, Tooltip, Icon, message, Button,
} from 'antd';

import Search from 'antd/lib/input/Search';

import { Context } from '../../store/neutron1';
import BaseComponent from '../BaseComponent';
import socket from '../../socket';

const ws = socket('query', '/command/');
// const live = socket('live', '/live/list');

/**
 * Send commands to agents. Simulates a CLI.
 */
const Commands = React.memo(({
  // macros,
}) => {

  const { state } = useContext(Context);
  /** Agents */
  // const [agentList, setAgentList] = useState([]);
  /** Selected agent to get requests from */
  const [selectedAgent, setSelectedAgent] = useState(['masdr', 'nordiasoft']);
  /** Requests possible from selectedAgent */
  const [agentRequests, setAgentRequests] = useState({});

  const [sortedAgentRequests, setSortedAgentRequests] = useState([]);
  /** Selected agent request */
  const [selectedRequest, setSelectedRequest] = useState('> agent');
  /** Agent command arguments */
  const [commandArguments, setCommandArguments] = useState('');
  /** Agent command history (to display in the terminal) */
  const [commandHistory, setCommandHistory] = useState([]);
  /** Save the last sent argument value */
  const [lastArgument, setLastArgument] = useState(null);
  /** Auto scroll the history log to the bottom */
  const [updateLog, setUpdateLog] = useState(null);

  /** DOM Element selector for history log */
  const cliEl = useRef(null);

  /** Manages requests for agent list and agent [node] [process] */
  ws.onmessage = ({ data }) => {
    try {
      const json = JSON.parse(data);

      const sortedRequests = [];
      const requests = {};

      if (json.output && json.output.requests) {
        // Clear agent requests for new agent

        json.output.requests.forEach((request) => {
          sortedRequests.push(
            request.token,
          );

          // Make commands mapped into an object
          requests[request.token] = {
            ...request,
          };
        });

        sortedRequests.sort();

        setAgentRequests(requests);
        setSortedAgentRequests(sortedRequests);

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

        setUpdateLog(true);
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

  /** Close ws on unmount */
  useEffect(() => () => ws.close(), []);

  /** Update height of the history log */
  useEffect(() => {
    cliEl.current.scrollTop = cliEl.current.scrollHeight;
    setUpdateLog(null);
  }, [updateLog])

  /** Handle submission of agent command */
  const sendCommand = () => {
    if (selectedRequest === '> agent') {
      ws.send(commandArguments);
      setCommandHistory([
        ...commandHistory,
        `➜ agent ${commandArguments}`,
      ]);
    } else {
      ws.send(`${selectedAgent[0]} ${selectedAgent[1]} ${selectedRequest} ${state.macro ? `${state.macro} ` : ''}${commandArguments}`);
      setCommandHistory([
        ...commandHistory,
        `➜ agent ${selectedAgent[0]} ${selectedAgent[1]} ${selectedRequest} ${state.macro ? `${state.macro} ` : ''}${commandArguments}`,
      ]);
    }

    setUpdateLog(true);
  };

  /** Get the possible requests for selected agent */
  const getRequests = () => {
    setSortedAgentRequests([]);
    setAgentRequests({});

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
          <Button>
            Retrieve Agent Nordiasoft Requests
          </Button>
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
              showSearch
              className="w-auto"
              defaultValue="> agent"
              dropdownMatchSelectWidth={false}
              onChange={value => setSelectedRequest(value)}
              value={selectedRequest}
              style={{ minWidth: '5em' }}
            >
              <Select.Option value="> agent">
                <Tooltip placement="right" title="node process [arguments]">
                  ➜ agent
                </Tooltip>
              </Select.Option>

              {
                sortedAgentRequests.map(token => (
                  <Select.Option value={token} key={token}>
                    <Tooltip placement="right" title={`${agentRequests[token] && agentRequests[token].synopsis ? `${agentRequests[token].synopsis} ` : ''}${agentRequests[token].description}`}>
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

// Commands.propTypes = {
//   macros: PropTypes.arrayOf(
//     PropTypes.shape({
//       name: PropTypes.name,
//     }),
//   ),
// };

// Commands.defaultProps = {
//   macros: [],
// }

export default Commands;
