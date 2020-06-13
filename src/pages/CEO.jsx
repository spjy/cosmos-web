import React, { useState, useEffect, useReducer } from 'react';
import {
  Badge, message, Divider, Collapse, Tag, Tooltip,
} from 'antd';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import {
  Context, actions, reducer,
} from '../store/dashboard';

import { socket, axios } from '../api';
// eslint-disable-next-line
import routes from '../routes';

function CEO() {
  /**
   * Store the agent statuses in the global store.
   */
  const [state, dispatch] = useReducer(reducer, {});

  /** Store the default page layout in case user wants to switch to it */
  const [, setSocketStatus] = useState('error');

  const [selectedTags, setSelectedTags] = useState([]);

  /** Get socket data from the agent */
  useEffect(() => {
    const live = socket('/live/all');

    /** Get latest data from neutron1_exec */
    live.onmessage = ({ data }) => {
      try {
        const json = JSON.parse(data);

        dispatch(actions.get(json.node_type, json));
      } catch (err) {
        // console.log(err);
      }
    };

    live.onclose = () => {
      setSocketStatus('error');
    };

    live.onerror = () => {
      setSocketStatus('error');
    };

    live.onopen = () => {
      setSocketStatus('success');
    };

    return () => {
      live.close(1000);
    };
  }, []);

  useEffect(() => {
    async function fetchNamespace() {
      try {
        const agents = await axios.get('/namespace/pieces');

        dispatch(actions.get('namespace', agents.data));
      } catch (error) {
        message.error(error);
      }
    }

    fetchNamespace();
  }, []);

  // Handle copying of pieces to clipboard
  const handleChange = (tag) => {
    const nextSelectedTags = [...selectedTags, tag];
    setSelectedTags(nextSelectedTags);

    setTimeout(() => {
      const remove = selectedTags.filter((t) => t !== tag);

      setSelectedTags(remove);
    }, 3000);
  };

  return (
    <Context.Provider value={{ state, dispatch }}>
      <div className="mt-5 mx-16 mb-16">
        {
          state.namespace && !(state.namespace.length === 0)
            ? Object.entries(state.namespace).map(([node, { pieces, agents }]) => (
              <div
                className="block shadow overflow-y-auto p-4 m-4 bg-white"
                style={{ overflowWrap: 'break-word' }}
                key={node}
              >
                <div>
                  <Badge status="success" />
                  <span className="text-lg font-bold">
                    {node}
                  </span>
                </div>
                <div className="flex-col pl-3 pt-2">
                  <div>
                    <span className="text-gray-500">agents</span>
                    <Divider type="vertical" />
                    {
                      agents.length > 0
                        ? agents.map((agent) => (
                          <span
                            key={agent}
                          >
                            { agent }
                            &nbsp;&nbsp;
                          </span>
                        )) : '-'
                    }
                  </div>
                  <div>
                    <Collapse
                      className="bg-transparent border-0 text-gray-500"
                      bordered={false}
                    >
                      <Collapse.Panel
                        header="Pieces"
                        className="my-2 border-b-0"
                      >
                        {
                          Object.keys(pieces).length > 0
                            ? Object.entries(pieces).map(([piece, name]) => {
                              if (piece.startsWith('piece_name_')) {
                                return (
                                  <Tooltip visible={selectedTags.indexOf(piece) > -1} title={`Copied ${name}!`}>
                                    <Tag.CheckableTag
                                      checked={selectedTags.indexOf(piece) > -1}
                                      onChange={() => handleChange(piece)}
                                      key={piece}
                                    >
                                      { name }
                                    </Tag.CheckableTag>
                                  </Tooltip>
                                );
                              }
                              return null;
                            }) : 'No pieces.'
                        }
                      </Collapse.Panel>
                    </Collapse>
                  </div>
                </div>
              </div>
            )) : 'Searching for nodes...'
        }
      </div>
    </Context.Provider>
  );
}

export default CEO;
