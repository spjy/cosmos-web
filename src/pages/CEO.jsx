import React, { useState, useEffect, useReducer } from 'react';
// import PropTypes from 'prop-types';
import { Badge } from 'antd';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import {
  Context, actions, reducer,
} from '../store/neutron1';

import socket from '../socket';
// eslint-disable-next-line
import routes from '../routes';

function CEO() {
  /**
   * Store the agent statuses in the global store.
   */
  const [state, dispatch] = useReducer(reducer, {});

  /** Store the default page layout in case user wants to switch to it */

  const [socketStatus, setSocketStatus] = useState('error');

  const [nodes, setNodes] = useState([]);

  /** Get socket data from the agent */
  useEffect(() => {
    const all = socket('live', '/live/all');

    /** Get latest data from neutron1_exec */
    all.onmessage = ({ data }) => {
      try {
        const json = JSON.parse(data);

        dispatch(actions.get(json.node_type, json));
      } catch (err) {
        // console.log(err);
      }
    };

    all.onclose = () => {
      setSocketStatus('error');
    };

    all.onerror = () => {
      setSocketStatus('error');
    };

    all.onopen = () => {
      setSocketStatus('success');
    };

    return () => {
      all.close(1000);
    };
  }, []);

  /** Maintain node list */
  useEffect(() => {
    if (state.list && state.list.agent_list) {
      const currentNodes = [];

      state.list.agent_list.forEach(({ agent }) => {
        const node = agent.split(':')[0];

        // Check if node was previously added; if not, append to array. Also check if it has agent cpu running
        if (!currentNodes.includes(node) && state.hasOwnProperty(`${node}:cpu`)) {
          currentNodes.push(node);
        }
      });

      setNodes(currentNodes);
    }
  }, [state]);

  return (
    <Context.Provider value={{ state, dispatch }}>
      <div className="mt-5 mx-16 mb-16">
        {
          nodes.length === 0 ? 'Searching for nodes...' : null
        }
        {
          nodes.map(node => (
            <div
              className="inline-block shadow overflow-y-auto p-4 m-1 bg-white"
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
                  <span className="text-gray-500">ip</span>
                  &nbsp;
                  {
                    state[`${node}:cpu`].node_ip
                  }
                </div>
              </div>
              <div className="flex-col pl-3 pt-2">
                <div>
                  <span className="text-gray-500">load</span>
                  &nbsp;
                  {
                    state[`${node}:cpu`].device_cpu_load_000
                  }
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </Context.Provider>
  );
}

CEO.propTypes = {};

export default CEO;
