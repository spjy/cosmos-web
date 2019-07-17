import React, { useState, useEffect, useReducer } from 'react';
import moment from 'moment-timezone';

import {
  Context, actions, reducer
} from '../../store/neutron1';

import socket from '../../socket';

import Card from '../../components/Missions/Components/LayoutCard';
import Example from '../../components/Missions/Components/Example';
import Clock from '../../components/Missions/Components/Clock';
import DisplayValue from '../../components/Missions/Components/DisplayValue';
import Content from '../../components/Missions/Components/Content';
import Commands from '../../components/Missions/Components/Commands';
import Status from '../../components/Missions/Components/Status';
import Chart from '../../components/Missions/Components/Chart';
import useWebSocket from '../../hooks/useWebSocket';

function neutron1() {
  /**
   * Store the agent statuses in the global store.
   */
  const [state, dispatch] = useReducer(reducer, {});

  const [latestMessage, setLatestMessage] = useState({});

  useEffect(() => {
    const cpu = socket('live', '/live/hsflpc23:cpu');
    const eps = socket('live', '/live/neutron1:eps');

    cpu.onopen = () => {
      console.log('open live');
    };

    /** Get latest data from neutron1_exec */
    cpu.onmessage = ({ data }) => {
      try {
        const json = JSON.parse(data);

        dispatch(actions.get('hsflpc23:cpu', json));
      } catch (err) {
        // console.log(err);
      }
    };

    eps.onopen = () => {
      console.log('open live');
    };

    /** Get latest data from neutron1_exec */
    eps.onmessage = ({ data }) => {
      try {
        const json = JSON.parse(data);

        dispatch(actions.get('neutron1:eps', json));
      } catch (err) {
        // console.log(err);
      }
    };

    return () => {
      console.log('ok');
      cpu.close(1000);
      eps.close(1000);
    };
  }, []);

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
              displayValues={
                [
                  {
                    name: 'CPU Load',
                    nodeProcess: 'hsflpc23:cpu',
                    dataKey: 'device_cpu_load_000',
                    unit: '%'
                  }
                ]
              }
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
            name="Temperature"
            nodeProc="neutron1:eps"
            XDataKey="utc"
            processXDataKey={
              x => moment.unix((((x + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DD HH:mm:ss')
            }
            processYDataKey={
              y => y
            }
            plots={
              [
                {
                  x: [],
                  y: [],
                  type: 'scatter',
                  marker: {
                    color: 'red'
                  },
                  name: '1',
                  YDataKey: 'device_tsen_temp_001',
                  nodeProcess: 'neutron1:eps',
                  live: true
                },
                {
                  x: [],
                  y: [],
                  type: 'scatter',
                  marker: {
                    color: 'blue'
                  },
                  name: '2',
                  YDataKey: 'device_tsen_temp_002',
                  nodeProcess: 'neutron1:eps',
                  live: true
                },
                {
                  x: [],
                  y: [],
                  type: 'scatter',
                  marker: {
                    color: 'orange'
                  },
                  name: '3',
                  YDataKey: 'device_tsen_temp_003',
                  nodeProcess: 'neutron1:eps',
                  live: true
                }
              ]
            }
          />
        </Card>
        <div className="flex flex-row">
          <Card>
            <Chart
              name="Voltage"
              nodeProc="neutron1:eps"
              XDataKey="utc"
              processXDataKey={
                x => moment.unix((((x + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DD HH:mm:ss')
              }
              processYDataKey={
                y => y
              }
              plots={
                [
                  {
                    x: [],
                    y: [],
                    type: 'scatter',
                    marker: {
                      color: 'red'
                    },
                    name: '5V',
                    YDataKey: 'device_bus_volt_001',
                    nodeProcess: 'neutron1:eps',
                    live: true
                  },
                  {
                    x: [],
                    y: [],
                    type: 'scatter',
                    marker: {
                      color: 'blue'
                    },
                    name: '3.3V',
                    YDataKey: 'device_bus_volt_002',
                    nodeProcess: 'neutron1:eps',
                    live: true
                  },
                  {
                    x: [],
                    y: [],
                    type: 'scatter',
                    marker: {
                      color: 'orange'
                    },
                    name: 'Battery Voltage',
                    YDataKey: 'device_bus_volt_003',
                    nodeProcess: 'neutron1:eps',
                    live: true
                  }
                ]
              }
            />
          </Card>

          <Card>
            <Chart
              name="Amperage"
              nodeProc="neutron1:eps"
              XDataKey="utc"
              processXDataKey={
                x => moment.unix((((x + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DD HH:mm:ss')
              }
              processYDataKey={
                y => y
              }
              plots={
                [
                  {
                    x: [],
                    y: [],
                    type: 'scatter',
                    marker: {
                      color: 'red'
                    },
                    name: '5V',
                    YDataKey: 'device_bus_amp_001',
                    nodeProcess: 'neutron1:eps',
                    live: true
                  },
                  {
                    x: [],
                    y: [],
                    type: 'scatter',
                    marker: {
                      color: 'blue'
                    },
                    name: '3.3V',
                    YDataKey: 'device_bus_amp_002',
                    nodeProcess: 'neutron1:eps',
                    live: true
                  },
                  {
                    x: [],
                    y: [],
                    type: 'scatter',
                    marker: {
                      color: 'orange'
                    },
                    name: 'Battery Voltage',
                    YDataKey: 'device_bus_amp_003',
                    nodeProcess: 'neutron1:eps',
                    live: true
                  }
                ]
              }
            />
          </Card>
        </div>
        <Card>
          <Chart
            name="HSFLPC23 CPU Load"
            nodeProc="hsflpc23:cpu"
            XDataKey="utc"
            processXDataKey={
              x => moment.unix((((x + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DD HH:mm:ss')
            }
            processYDataKey={
              y => y
            }
            plots={
              [
                {
                  x: [],
                  y: [],
                  type: 'scatter',
                  marker: {
                    color: 'red'
                  },
                  name: 'cpu load',
                  YDataKey: 'device_cpu_load_000',
                  nodeProcess: 'hsflpc23:cpu',
                  live: true
                }
              ]
            }
          />
        </Card>
      </div>
    </Context.Provider>
  );
}

export default neutron1;
