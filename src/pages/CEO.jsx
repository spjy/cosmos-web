import React, {
  useState, useEffect, useReducer, useRef,
} from 'react';
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
  // Store selected tags
  const [selectedTags, setSelectedTags] = useState({});
  // Last selected tag
  const [lastSelectedTag, setLastSelectedTag] = useState('');

  // Ref to get current state value, for setTimeout function
  const selectedTagsRef = useRef(selectedTags);
  selectedTagsRef.current = selectedTags;

  const lastSelectedTagRef = useRef(null);

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
  const copyPieceName = (node, tag, name) => {
    // Check if it was not selected
    if (!(node in selectedTags && selectedTags[node].includes(tag))) {
      setLastSelectedTag(name);

      lastSelectedTagRef.current.select();
      document.execCommand('copy');

      // Add to selected array for node
      const nextSelectedTags = {
        ...selectedTags,
        [node]: selectedTags[node] ? [...selectedTags[node], tag] : [tag],
      };

      setSelectedTags(nextSelectedTags);

      // After 2 sec, remove from array
      setTimeout(() => {
        // To handle closure
        const tags = selectedTagsRef.current;
        const remove = tags[node].filter((t) => t !== tag);

        setSelectedTags(remove);
      }, 2000);
    }
  };

  return (
    <Context.Provider value={{ state, dispatch }}>
      <div className="mt-5 mx-16 mb-16">
        <textarea
          className="hidden"
          ref={lastSelectedTagRef}
          value={lastSelectedTag}
        />
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
                                  <Tooltip
                                    visible={selectedTags[node] ? selectedTags[node].indexOf(piece) > -1 : false}
                                    title={`Copied ${name}!`}
                                    key={`${node}:${piece}`}
                                  >
                                    <Tag.CheckableTag
                                      checked={selectedTags[node] ? selectedTags[node].indexOf(piece) > -1 : false}
                                      onChange={() => copyPieceName(node, piece, name)}
                                      key={`${node}:${piece}`}
                                    >
                                      { piece.split('_')[2] }
                                      :
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
