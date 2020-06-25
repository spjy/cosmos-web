import React, {
  useState, useEffect, useRef, useContext,
} from 'react';
import PropTypes from 'prop-types';

import {
  Input, Select, Tooltip, message, Button,
} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';

// import Search from 'antd/lib/input/Search';
import { axios } from '../../api';

import { Context } from '../../store/dashboard';
import BaseComponent from '../BaseComponent';

/**
 * Send commands to agents through agent mongo web socket. Simulates a CLI.
 * Gives the ability to select commonly used node:process; appends this value to after the `agent`
 * command.
 * Allows for running agent commands. Logs inputs and ouputs in the white box above the input box.
 */
const Commands = React.memo(({
  height,
  commands,
}) => {
  const { state } = useContext(Context);
  /** Agents */
  // const [agentList, setAgentList] = useState([]);

  /** Component's agent list storage */
  const [list, setList] = useState([]);
  /** Selected agent to get requests from */
  const [selectedAgent, setSelectedAgent] = useState([]);
  /** Requests possible from selectedAgent */
  const [agentRequests, setAgentRequests] = useState({});
  /** List of sorted agent requests */
  const [sortedAgentRequests, setSortedAgentRequests] = useState([]);
  /** Selected agent request */
  const [selectedRequest, setSelectedRequest] = useState('> agent');
  /** Agent command arguments */
  const [commandArguments, setCommandArguments] = useState('');
  /** Agent command history (to display in the terminal) */
  const [commandHistory, setCommandHistory] = useState([]);
  /** Save the last sent argument value */
  const [lastArgument, setLastArgument] = useState('');
  /** Auto scroll the history log to the bottom */
  const [updateLog, setUpdateLog] = useState(null);
  /** Store autocompletions */
  const [autocompletions, setAutocompletions] = useState([]);
  /** Currently selected dropdown value of command list */
  const [macroCommand, setMacroCommand] = useState(null);

  /** DOM Element selector for history log */
  const cliEl = useRef(null);
  /** DOM Element selector for argument input */
  const inputEl = useRef(null);

  const commandHistoryEl = useRef(null);
  commandHistoryEl.current = commandHistory;

  /** Manages requests for agent list and agent [node] [process] */
  const sendCommandApi = async (command) => {
    setCommandHistory([
      ...commandHistoryEl.current,
      `➜ ${moment().toISOString()} ${command}`,
    ]);

    setUpdateLog(true);

    // retrieve command output
    try {
      const { data } = await axios.post('/command', {
        data: {
          command,
        },
      });

      try {
        const json = JSON.parse(data);

        // json checking for json.output, json.error
        if (json && json.output && json.output.requests) {
          const sortedRequests = [];
          const requests = {};

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

          // Alphabetical order
          sortedRequests.sort();

          // Set agent requests
          setAgentRequests(requests);
          setSortedAgentRequests(sortedRequests);

          message.destroy();
          message.success('Retrieved agent requests.');
        } else if (json && json.output) {
          // agent node proc cmd
          setCommandHistory([
            ...commandHistoryEl.current,
            `${moment().toISOString()} ${data.output}`,
          ]);

          message.destroy();
        } else if (json && json.error) {
          throw new Error(json.error);
        } else {
          throw new Error();
        }
      } catch (error) {
        message.destroy();
        // non-json
        setCommandHistory([
          ...commandHistoryEl.current,
          `${moment().toISOString()} ${data}`,
        ]);
      }
      setUpdateLog(true);
    } catch (error) {
      message.destroy();
      message.error(error);
    }
  };

  /** Handle submission of agent command */
  const sendCommand = async () => {
    setLastArgument(commandArguments);

    switch (selectedRequest) {
      case '> agent':
        sendCommandApi(`${process.env.COSMOS_BIN}agent ${commandArguments}`);
        break;
      case '> command_generator':
        sendCommandApi(`${process.env.COSMOS_BIN}command_generator ${commandArguments.replace(/"/g, "'")}`);
        break;
      default:
        sendCommandApi(`${process.env.COSMOS_BIN}agent ${selectedAgent[0]} ${selectedAgent[1]} ${selectedRequest} ${state.macro ? `${state.macro} ` : ''}${commandArguments}`);
        break;
    }

    setUpdateLog(true);
  };

  /** Send macro command */
  const sendMacroCommand = async () => {
    sendCommandApi(`${process.env.COSMOS_BIN}agent ${macroCommand}`);
  };

  /** Retrieve file autocompletion */
  const getAutocomplete = async (autocomplete) => {
    setCommandHistory([
      ...commandHistory,
      `autocomplete ${autocomplete}`,
    ]);

    // retrieve autocompletions
    const { data } = await axios.post('/command', {
      responseType: 'text',
      data: {
        command: `compgen -c ${autocomplete}`,
      },
    });

    setAutocompletions(data.split('\n'));
  };

  /** Upon the state.list updating, update the store's list */
  useEffect(() => {
    if (state.list) {
      setList(state.list.agent_list);
    }
  }, [state.list]);

  /** Autocomplete automatically if it's the only one in the array */
  useEffect(() => {
    if (autocompletions.length === 2) {
      const args = commandArguments.split(' ');

      // eslint-disable-next-line prefer-destructuring
      args[args.length - 1] = autocompletions[0];

      setCommandArguments(args.join(' '));

      setAutocompletions([]);

      setUpdateLog(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autocompletions]);

  /** Get the possible requests for selected agent */
  const getRequests = async (agent) => {
    setSelectedAgent(agent);

    setSortedAgentRequests([]);
    setAgentRequests({});

    if (agent.length > 0) {
      sendCommandApi(`${process.env.COSMOS_BIN}agent ${agent[0]} ${agent[1]} help_json`);
    }
  };

  /** Update height of the history log to go to the bottom */
  useEffect(() => {
    cliEl.current.scrollTop = cliEl.current.scrollHeight;
    setUpdateLog(null);
  }, [updateLog]);

  const colorTime = (command, i) => {
    const allCommands = command.split(' ');

    if (allCommands[0] === '➜') {
      allCommands.splice(0, 1);
      const time = allCommands.splice(0, 1);

      return (
        <div key={i}>
          ➜&nbsp;
          <span className="text-gray-600">
            [
            { time }
            ]
          </span>
          &nbsp;
          { allCommands.join(' ') }
        </div>
      );
    }

    const time = allCommands.splice(0, 1);

    return (
      <div key={i}>
        <span className="text-gray-600">
          [
          { time }
          ]
        </span>
        &nbsp;
        {
          allCommands.join(' ')
        }
      </div>
    );
  };

  return (
    <BaseComponent
      name="Commands"
      subheader=""
      liveOnly
      height={height}
      showStatus={false}
    >
      <div className="flex flex-wrap">
        <div
          className="w-full"
        >
          <Select
            className="block mb-2"
            dropdownMatchSelectWidth={false}
            onChange={(value) => getRequests(value.split(':'))}
            placeholder="Select agent node and process"
          >
            {
              list.map(({ agent }) => (
                <Select.Option
                  key={agent}
                  value={agent}
                >
                  {agent}
                </Select.Option>
              ))
            }
          </Select>
          <div className="flex">
            <div className="mr-2">
              <Select
                showSearch
                className="block mb-2"
                onChange={(value) => setMacroCommand(value)}
                placeholder="Command List"
              >
                {
                  commands.map(({ name, command }) => (
                    <Select.Option
                      key={name}
                      value={command}
                    >
                      <Tooltip placement="right" title={command}>
                        {name}
                      </Tooltip>
                    </Select.Option>
                  ))
                }
              </Select>
            </div>
            <Button
              disabled={!macroCommand}
              onClick={() => sendMacroCommand()}
            >
              Send
            </Button>
          </div>
        </div>
        {/* <div className="w-full py-2">
          <Search
            placeholder="Select node:process"
            onSearch={(value) => setSelectedAgent(value.split(':'))}
            enterButton={<SelectOutlined />}
          />
        </div> */}
      </div>
      <div
        className="border border-gray-300 rounded mb-2 p-4 bg-white font-mono h-32 max-h-full resize-y overflow-y-auto"
        ref={cliEl}
      >
        {
          // eslint-disable-next-line
          commandHistory.map((command, i) => (colorTime(command, i)))
        }
        {
          autocompletions.length > 1
            ? (
              <span className="text-red-500 cursor-pointer hover:underline">
                Clear&nbsp;
                <CloseOutlined onClick={() => setAutocompletions([])} />
              </span>
            )
            : ''
        }
        {
          autocompletions.map((autocompletion) => (
            <span
              tabIndex={0}
              role="link"
              onClick={() => {
                // Change the last array element of the command arguments
                // to have selected autocompeleted path
                const args = commandArguments.split(' ');

                args[args.length - 1] = autocompletion;
                setCommandArguments(args.join(' '));

                inputEl.current.focus();
              }}
              onKeyDown={() => {}}
              className="text-blue-500 p-2 hover:underline cursor-pointer"
              key={autocompletion}
            >
              {autocompletion}
            </span>
          ))
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
              onChange={(value) => setSelectedRequest(value)}
              value={selectedRequest}
              style={{ minWidth: '5em' }}
            >
              <Select.Option value="> agent">
                <Tooltip placement="right" title="node process [arguments]">
                  ➜ agent
                </Tooltip>
              </Select.Option>
              <Select.Option value="> command_generator">
                <Tooltip placement="right" title="name command [time | +sec] [node] [condition] [repeat_flag]">
                  ➜ command_generator
                </Tooltip>
              </Select.Option>
              {
                sortedAgentRequests.map((token) => (
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
          onKeyDown={(e) => {
            if (e.keyCode === 38) {
              setCommandArguments(lastArgument);
            } else if (e.keyCode === 9) {
              e.preventDefault();
              getAutocomplete(commandArguments.split(' ')[commandArguments.split(' ').length - 1]);
            }
          }}
          value={commandArguments}
          ref={inputEl}
        />
      </div>
    </BaseComponent>
  );
});

Commands.propTypes = {
  height: PropTypes.number.isRequired,
  commands: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      command: PropTypes.string,
    }),
  ),
};

Commands.defaultProps = {
  commands: [],
};

export default Commands;
