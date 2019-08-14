import React, { useEffect, useReducer } from 'react';

import Content from '../components/Missions/Components/Content';
// eslint-disable-next-line
import LayoutManager from '../components/Missions/Components/LayoutManager';

import socket from '../socket';

import {
  Context, actions, reducer,
} from '../store/neutron1';

function DashboardManager() {
  /**
   * Store the agent statuses in the global store.
   */
  const [state, dispatch] = useReducer(reducer, {});

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

    return () => {
      all.close(1000);
    };
  }, []);

  return (
    <Context.Provider value={{ state, dispatch }}>
      <div className="m-3 shadow">
        <Content
          name="Dashboard Manager"
        >
          <LayoutManager />
        </Content>
      </div>
    </Context.Provider>
  );
}

export default DashboardManager;
