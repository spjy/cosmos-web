import React, { useState, useEffect, useReducer } from 'react';
import MyScheduler from '../components/Calendar';

import {
  Context, actions, reducer,
} from '../store/dashboard';

import { socket } from '../api';
// eslint-disable-next-line
import routes from '../routes';

function Scheduler() {
  /**
   * Store the agent statuses in the global store.
   */
  const [state, dispatch] = useReducer(reducer, {});

  /** Store the default page layout in case user wants to switch to it */
  const [, setSocketStatus] = useState('error');

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

  return (
    <Context.Provider value={{ state, dispatch }}>
      <MyScheduler />
    </Context.Provider>
  );
}

Scheduler.propTypes = {};

export default Scheduler;
