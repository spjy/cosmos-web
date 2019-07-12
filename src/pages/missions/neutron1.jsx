import React, { useState, useEffect, useReducer } from 'react';
import { Form, Input } from 'antd';

import {
  Context, actions, reducer
} from '../../store/neutron1';

import socket from '../../socket';
import moment from 'moment-timezone';

import Card from '../../components/Missions/Components/LayoutCard';
import Example from '../../components/Missions/Components/Example';
import Clock from '../../components/Missions/Components/Clock';
import DisplayValue from '../../components/Missions/Components/DisplayValue';
import Content from '../../components/Missions/Components/Content';
import Commands from '../../components/Missions/Components/Commands';
import Status from '../../components/Missions/Components/Status';
import Chart from '../../components/Missions/Components/Chart';

function neutron1() {
  /**
   * Store the agent statuses in the global store.
   */
  const [state, dispatch] = useReducer(reducer, {});
  /** Storage for form values */
  const [form, setForm] = useState({});
  /** Status of the live switch */
  const [liveSwitch, setLiveSwitch] = useState();

  const [latestMessage, setLatestMessage] = useState({});

  const [ws] = useState(socket(`ws://${process.env.REACT_APP_WEBSOCKET_IP}:${process.env.REACT_APP_LIVE_WEBSOCKET_PORT}/live/hsflpc23:cpu`));

  /** Get latest data from neutron1_exec */
  ws.onmessage = ({ data }) => {
    let json;

    try {
      json = JSON.parse(data);
    } catch (err) {
      // console.log(err);
    }

    if (json) {
      dispatch(actions.get('hsflpc23:cpu', json));
    }
  };

  return (
    <Context.Provider value={{ state, dispatch }}>
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
              name="HSFLPC23 CPU Load"
              subheader="06231999-1630Z"
              nodeProc="hsflpc23:cpu"
              dataKey="device_cpu_load_000"
              unit="%"
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
        <div className="pb-1">
          <Card>
            <Commands />
          </Card>
        </div>
        <Card>
          <Chart
            name="Chart"
            liveOnly={false}
            nodeProc="hsflpc23:cpu"
            XDataKey="utc"
            YDataKey="device_cpu_load_000"
            processXDataKey={
              x => {
                return moment.unix(((x - 2440587.5) * 86400.0)).format('YYYY-MM-DD HH:mm:ss')
              }
            }
            processYDataKey={
              y => y
            }
          />
        </Card>
      </div>
    </Context.Provider>
  );
}

export default neutron1;
