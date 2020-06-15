import React, { useEffect, useReducer } from 'react';

import BaseComponent from '../components/BaseComponent';
// eslint-disable-next-line
import LayoutManager from '../components/LayoutManager';

import { socket } from '../api';

import {
  Context, actions, reducer,
} from '../store/dashboard';

/**
 * Component that manages the layout configuration page (aka Dashboard Manager).
 */
function DashboardManager() {
  /**
   * Store the agent statuses in the global store.
   */
  const [state, dispatch] = useReducer(reducer, {});

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

    return () => {
      live.close(1000);
    };
  }, []);

  return (
    <Context.Provider value={{ state, dispatch }}>
      <div className="m-3 shadow">
        <BaseComponent
          name="Dashboard Manager"
        >
          <LayoutManager />
        </BaseComponent>
      </div>
    </Context.Provider>
  );
}

export default DashboardManager;
