import React, { useState, useEffect, useReducer } from 'react';
// import PropTypes from 'prop-types';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import {
  Context, actions, reducer,
} from '../store/neutron1';

import { socket } from '../socket';
// eslint-disable-next-line
import routes from '../routes';

import Events from '../components/Dashboard/Events';

function Scheduler() {
  /**
   * Store the agent statuses in the global store.
   */
  const [state, dispatch] = useReducer(reducer, {});

  /** Store the default page layout in case user wants to switch to it */

  const [, setSocketStatus] = useState('error');

  const [, setNodes] = useState([]);

  /** Get socket data from the agent */
  useEffect(() => {
    const live = socket('live', '/live/all');

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

  /** Maintain node list */
  useEffect(() => {
    if (state.list && state.list.agent_list) {
      const currentNodes = [];

      state.list.agent_list.forEach(({ agent }) => {
        const node = agent.split(':')[0];

        // Check if node was previously added; if not, append to array.
        // Also check if it has agent cpu running
        // eslint-disable-next-line
        if (!currentNodes.includes(node) && state.hasOwnProperty(`${node}:cpu`)) {
          currentNodes.push(node);
        }
      });

      setNodes(currentNodes);
    }
  }, [state]);

  return (
    <Context.Provider value={{ state, dispatch }}>
      <Calendar/>
    </Context.Provider>
  );
}

Scheduler.propTypes = {};

export default Scheduler;
