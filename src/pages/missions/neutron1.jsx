import React, { useState, useEffect, useReducer } from 'react';
import moment from 'moment-timezone';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import {
  Context, actions, reducer,
} from '../../store/neutron1';

import socket from '../../socket';

import Clock from '../../components/Missions/Components/Clock';
import DisplayValue from '../../components/Missions/Components/DisplayValue';
import Content from '../../components/Missions/Components/Content';
import Commands from '../../components/Missions/Components/Commands';
import Status from '../../components/Missions/Components/Status';
import Chart from '../../components/Missions/Components/Chart';
import Globe from '../../components/Missions/Components/Globe';
import Attitude from '../../components/Missions/Components/Attitude';

const ResponsiveGridLayout = WidthProvider(Responsive);

function neutron1() {
  /**
   * Store the agent statuses in the global store.
   */
  const [state, dispatch] = useReducer(reducer, {});

  const [layouts] = useState({
    lg: [
      {
        i: 'a',
        x: 0,
        y: 0,
        w: 4,
        h: 7,
      },
      {
        i: 'b',
        x: 4,
        y: 0,
        w: 4,
        h: 7,
      },
      {
        i: 'c',
        x: 8,
        y: 0,
        w: 4,
        h: 7,
      },
      {
        i: 'd',
        x: 0,
        y: 1,
        w: 12,
        h: 9,
      },
      {
        i: 'e',
        x: 0,
        y: 2,
        w: 6,
        h: 20,
      },
      {
        i: 'f',
        x: 0,
        y: 3,
        w: 12,
        h: 18,
      },
      {
        i: 'g',
        x: 0,
        y: 4,
        w: 12,
        h: 18,
      },
      {
        i: 'h',
        x: 0,
        y: 5,
        w: 12,
        h: 18,
      },
      {
        i: 'i',
        x: 0,
        y: 6,
        w: 12,
        h: 18,
      },
      {
        i: 'j',
        x: 6,
        y: 2,
        w: 6,
        h: 34,
      },
    ],
  });

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
      console.log('ok');
      all.close(1000);
    };
  }, []);

  return (
    <Context.Provider value={{ state, dispatch }}>
      <div className="m-3 mb-32">
        <ResponsiveGridLayout
          className="layout"
          breakpoints={{
            lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0,
          }}
          cols={{
            lg: 12, md: 10, sm: 6, xs: 4, xxs: 2,
          }}
          layouts={layouts}
          margin={[12, 12]}
          draggableHandle=".dragHandle"
          draggableCancel=".preventDragHandle"
          rowHeight={20}
        >
          <div key="a" className="p-3 shadow overflow-x-auto" style={{ backgroundColor: '#fbfbfb' }}>
            <Content
              name="Agent Statuses"
            >
              <Status
                statuses={[]}
              />
            </Content>
          </div>
          <div key="b" className="p-3 shadow overflow-x-auto" style={{ backgroundColor: '#fbfbfb' }}>
            <DisplayValue
              name="HSFLPC23 CPU Load"
              displayValues={
                [
                  {
                    name: 'CPU Load',
                    nodeProcess: 'hsflpc23:cpu',
                    dataKey: 'device_cpu_load_000',
                    unit: '%',
                    processDataKey: x => x.toFixed(2),
                  },
                  {
                    name: 'GiB',
                    nodeProcess: 'hsflpc23:cpu',
                    dataKey: 'device_cpu_gib_000',
                    unit: 'GiB',
                    processDataKey: x => x.toFixed(2),
                  },
                  {
                    name: 'Max GiB',
                    nodeProcess: 'hsflpc23:cpu',
                    dataKey: 'device_cpu_maxgib_000',
                    unit: 'GiB',
                    processDataKey: x => x.toFixed(2),
                  },
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
          </div>
          <div key="c" className="p-3 shadow overflow-x-auto" style={{ backgroundColor: '#fbfbfb' }}>
            <Clock />
          </div>
          <div key="d" className="p-3 shadow overflow-x-auto" style={{ backgroundColor: '#fbfbfb' }}>
            <Commands />
          </div>
          <div key="e" className="p-3 shadow overflow-x-auto" style={{ backgroundColor: '#fbfbfb' }}>
            <Globe
              name="Orbit"
              nodeProc="beagle1:adcs"
              orbits={[
                {
                  name: 'neutron1',
                  modelFileName: 'cubesat1.glb',
                  nodeProcess: 'cubesat1:propagator_simple',
                  live: true,
                  position: [21.289373, 157.917480, 350000.0],
                  orientation: {
                    d: {
                      x: 0,
                      y: 0,
                      z: 0,
                    },
                    w: 0,
                  },
                },
              ]}
            />
          </div>
          <div key="f" className="p-3 shadow overflow-x-auto" style={{ backgroundColor: '#fbfbfb' }}>
            <Chart
              name="Temperature"
              nodeProc="beagle1:eps"
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
                      color: 'red',
                    },
                    name: '1',
                    YDataKey: 'device_tsen_temp_001',
                    nodeProcess: 'beagle1:eps',
                    live: true,
                  },
                  {
                    x: [],
                    y: [],
                    type: 'scatter',
                    marker: {
                      color: 'blue',
                    },
                    name: '2',
                    YDataKey: 'device_tsen_temp_002',
                    nodeProcess: 'beagle1:eps',
                    live: true,
                  },
                  {
                    x: [],
                    y: [],
                    type: 'scatter',
                    marker: {
                      color: 'orange',
                    },
                    name: '3',
                    YDataKey: 'device_tsen_temp_003',
                    nodeProcess: 'beagle1:eps',
                    live: true,
                  },
                ]
              }
            />
          </div>
          <div key="g" className="p-3 shadow overflow-x-auto" style={{ backgroundColor: '#fbfbfb' }}>
            <Chart
              name="Voltage"
              nodeProc="beagle1:eps"
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
                      color: 'red',
                    },
                    name: '5V',
                    YDataKey: 'device_bus_volt_001',
                    nodeProcess: 'beagle1:eps',
                    live: true,
                  },
                  {
                    x: [],
                    y: [],
                    type: 'scatter',
                    marker: {
                      color: 'blue',
                    },
                    name: '3.3V',
                    YDataKey: 'device_bus_volt_002',
                    nodeProcess: 'beagle1:eps',
                    live: true,
                  },
                  {
                    x: [],
                    y: [],
                    type: 'scatter',
                    marker: {
                      color: 'orange',
                    },
                    name: 'Battery Voltage',
                    YDataKey: 'device_bus_volt_003',
                    nodeProcess: 'beagle1:eps',
                    live: true,
                  },
                ]
              }
            />
          </div>
          <div key="h" className="p-3 shadow overflow-x-auto" style={{ backgroundColor: '#fbfbfb' }}>
            <Chart
              name="Amperage"
              nodeProc="beagle1:eps"
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
                      color: 'red',
                    },
                    name: '5V',
                    YDataKey: 'device_bus_amp_001',
                    nodeProcess: 'beagle1:eps',
                    live: true,
                  },
                  {
                    x: [],
                    y: [],
                    type: 'scatter',
                    marker: {
                      color: 'blue',
                    },
                    name: '3.3V',
                    YDataKey: 'device_bus_amp_002',
                    nodeProcess: 'beagle1:eps',
                    live: true,
                  },
                  {
                    x: [],
                    y: [],
                    type: 'scatter',
                    marker: {
                      color: 'orange',
                    },
                    name: 'Battery Voltage',
                    YDataKey: 'device_bus_amp_003',
                    nodeProcess: 'beagle1:eps',
                    live: true,
                  },
                ]
              }
            />
          </div>
          <div key="i" className="p-3 shadow overflow-x-auto" style={{ backgroundColor: '#fbfbfb' }}>
            <Chart
              name="Battery Health"
              nodeProc="beagle1:eps"
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
                      color: 'red',
                    },
                    name: 'Battery Percentage',
                    YDataKey: 'device_batt_percentage_000',
                    nodeProcess: 'neutron1:eps',
                    live: true,
                  },
                  {
                    x: [],
                    y: [],
                    type: 'scatter',
                    mode: 'marker',
                    marker: {
                      color: 'blue',
                    },
                    name: 'Charge',
                    YDataKey: 'device_batt_charge_000',
                    nodeProcess: 'neutron1:eps',
                    live: true,
                  },
                ]
              }
            />
          </div>
          <div key="j" className="p-3 shadow overflow-x-auto" style={{ backgroundColor: '#fbfbfb' }}>
            <Attitude
              name="Attitude"
              attitudes={[
                {
                  name: 'n1',
                  nodeProcess: 'cubesat1:propagator_simple',
                  quaternions: {
                    d: {
                      x: 0,
                      y: 0,
                      z: 0,
                    },
                    w: 0,
                  },
                  live: true,
                },
              ]}
            />
          </div>
        </ResponsiveGridLayout>
      </div>
      {/* <div className="p-4">
        <div className="flex flex-row">
          <Card flex="w-1/3">
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
          <Card flex="w-1/3">
            <DisplayValue
              name="HSFLPC23 CPU Load"
              displayValues={
                [
                  {
                    name: 'CPU Load',
                    nodeProcess: 'hsflpc23:cpu',
                    dataKey: 'device_cpu_load_000',
                    unit: '%',
                    processDataKey: x => x.toFixed(2)
                  },
                  {
                    name: 'GiB',
                    nodeProcess: 'hsflpc23:cpu',
                    dataKey: 'device_cpu_gib_000',
                    unit: 'GiB',
                    processDataKey: x => x.toFixed(2)
                  },
                  {
                    name: 'Max GiB',
                    nodeProcess: 'hsflpc23:cpu',
                    dataKey: 'device_cpu_maxgib_000',
                    unit: 'GiB',
                    processDataKey: x => x.toFixed(2)
                  },
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
          <Card flex="w-1/3">
            <Clock />
          </Card>
        </div>
        <div className="pb-1">
          <Card>
            <Commands />
          </Card>
        </div>
        <Card>
          <Globe
            name="Orbit"
            nodeProc="beagle1:adcs"
            orbits={[
              {
                name: 'neutron1',
                modelFileName: 'cubesat1.glb',
                nodeProcess: 'neutron1:adcs',
                live: true,
                position: [21.289373, 157.917480, 350000.0],
              },
            ]}
          />
        </Card>
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
          <Card flex="w-1/2">
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

          <Card flex="w-1/2">
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
            name="Battery Health"
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
                  name: 'Battery Percentage',
                  YDataKey: 'device_batt_percentage_000',
                  nodeProcess: 'neutron1:eps',
                  live: true
                },
                {
                  x: [],
                  y: [],
                  type: 'scatter',
                  mode: 'marker',
                  marker: {
                    color: 'blue'
                  },
                  name: 'Charge',
                  YDataKey: 'device_batt_charge_000',
                  nodeProcess: 'neutron1:eps',
                  live: true
                }
              ]
            }
          />
        </Card>

        <Card>
          <Chart
            name="neutron1 CPU Load"
            nodeProc="neutron1:cpu"
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
                  nodeProcess: 'neutron1:cpu',
                  live: true
                }
              ]
            }
          />
        </Card>
      </div> */}
    </Context.Provider>
  );
}

export default neutron1;
