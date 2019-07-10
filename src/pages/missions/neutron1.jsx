import React, { useState, useEffect } from 'react';
import { Form, Input } from 'antd';

import {
  Context, actions, reducer
} from '../../store/AgentStatuses';

import socket from '../../socket';

import Card from '../../components/Missions/Components/LayoutCard';
import Example from '../../components/Missions/Components/Example';
import Clock from '../../components/Missions/Components/Clock';
import DisplayValue from '../../components/Missions/Components/DisplayValue';
import Content from '../../components/Missions/Components/Content';
import AgentCommands from '../../components/Missions/Components/AgentCommands';
import Status from '../../components/Missions/Components/Status';
import Chart from '../../components/Missions/Components/Chart';

function neutron1() {
  /**
   * Store the agent statuses in the global store.
   */
  // const [state, dispatch] = useReducer(reducer, { payload: [] });
  /** Storage for form values */
  const [form, setForm] = useState({});
  /** Status of the live switch */
  const [liveSwitch, setLiveSwitch] = useState();

  const [latestMessage, setLatestMessage] = useState({});

  useEffect(() => {
    const ws = socket(`ws://${process.env.REACT_APP_WEBSOCKET_IP}:${process.env.REACT_APP_LIVE_WEBSOCKET_PORT}/live/neutron1_exec`);

    /** Get latest data from neutron1_exec */
    ws.onmessage = (data) => {
      let json;

      try {
        json = JSON.parse(data);
      } catch (err) {
        console.log(err);
      }

      if (json) {
        setLatestMessage(json);
      }
    };
  });


  return (
    <div className="p-4">
      <div className="flex flex-row">
        <Card>
          <Content
            name="Agent Statuses"
          >
            <div className="h-32 overflow-y-auto resize-y">
              <Status
                statuses={[]}
              />
            </div>
          </Content>
        </Card>
        <Card>
          <Example />
        </Card>
        <Card>
          <DisplayValue
            name="Average Temperature"
            subheader="06231999-1630Z"
          >
            <div className="text-center font-bold text-red-600 text-xl">
              67&deg;C
            </div>
          </DisplayValue>
        </Card>
        <Card>
          <Clock />
        </Card>
      </div>
      <Card>
        <AgentCommands />
      </Card>
      <Card>
        <Chart
          name="Chart"
          liveOnly={false}
        />
      </Card>
    </div>
  );
}

export default neutron1;
