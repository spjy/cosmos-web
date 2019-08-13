import React, { useState, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import {
  Context, actions, reducer,
} from '../../store/neutron1';

import socket from '../../socket';

import AsyncComponent from '../../components/Missions/Components/AsyncComponent';
import LayoutManager from '../../components/Missions/Components/LayoutManager';

const ResponsiveGridLayout = WidthProvider(Responsive);

function Neutron1({
  path,
}) {
  /**
   * Store the agent statuses in the global store.
   */
  const [state, dispatch] = useReducer(reducer, {});

  const [layouts, setLayouts] = useState({
    lg: [
      {
        i: 'a',
        x: 0,
        y: 0,
        w: 4,
        h: 7,
        component: {
          name: 'Status',
        },
      },
      {
        i: 'b',
        x: 4,
        y: 0,
        w: 4,
        h: 7,
        component: {
          name: 'DisplayValue',
          props: {
            name: 'beagle1 CPU',
            displayValues: [
              {
                name: 'CPU Load',
                nodeProcess: 'beagle1:cpu',
                dataKey: 'device_cpu_load_000',
                unit: '%',
                processDataKey: x => x.toFixed(2),
              },
              {
                name: 'GiB',
                nodeProcess: 'beagle1:cpu',
                dataKey: 'device_cpu_gib_000',
                unit: 'GiB',
                processDataKey: x => x.toFixed(2),
              },
              {
                name: 'Max GiB',
                nodeProcess: 'beagle1:cpu',
                dataKey: 'device_cpu_maxgib_000',
                unit: 'GiB',
                processDataKey: x => x.toFixed(2),
              },
            ],
          },
        },
      },
      {
        i: 'c',
        x: 8,
        y: 0,
        w: 4,
        h: 7,
        component: {
          name: 'Clock',
        },
      },
      {
        i: 'd',
        x: 0,
        y: 1,
        w: 12,
        h: 10,
        component: {
          name: 'Commands',
        },
      },
      {
        i: 'e',
        x: 0,
        y: 2,
        w: 6,
        h: 21,
        component: {
          name: 'Globe',
          props: {
            name: 'Orbit',
            orbits: [
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
            ],
          },
        },
      },
      {
        i: 'f',
        x: 6,
        y: 2,
        w: 6,
        h: 21,
        component: {
          name: 'Attitude',
          props: {
            attitudes: [
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
            ],
          },
        },
      },
      {
        i: 'g',
        x: 0,
        y: 3,
        w: 12,
        h: 18,
        component: {
          name: 'Chart',
          props: {
            name: 'Temperature',
            XDataKey: 'utc',
            processXDataKey: x => moment.unix((((x + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DD HH:mm:ss'),
            plots: [
              {
                x: [],
                y: [],
                type: 'scatter',
                marker: {
                  color: 'red',
                },
                name: '1',
                YDataKey: 'device_tsen_temp_001',
                processYDataKey: y => y - 273.15,
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
                processYDataKey: y => y - 273.15,
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
                processYDataKey: y => y - 273.15,
                nodeProcess: 'beagle1:eps',
                live: true,
              },
            ],
          },
        },
      },
      {
        i: 'h',
        x: 0,
        y: 4,
        w: 12,
        h: 18,
        component: {
          name: 'Chart',
          props: {
            name: 'Voltage',
            XDataKey: 'utc',
            processXDataKey: x => moment.unix((((x + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DD HH:mm:ss'),
            plots: [
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
            ],
          },
        },
      },
      {
        i: 'i',
        x: 0,
        y: 5,
        w: 12,
        h: 18,
        component: {
          name: 'Chart',
          props: {
            name: 'Amperage',
            XDataKey: 'utc',
            processXDataKey: x => moment.unix((((x + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DD HH:mm:ss'),
            plots: [
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
            ],
          },
        },
      },
      {
        i: 'j',
        x: 0,
        y: 6,
        w: 12,
        h: 18,
        component: {
          name: 'Chart',
          props: {
            name: 'Battery Health',
            plots: [
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
            ],
          },
        },
      },
    ],
  });

  useEffect(() => {
    const layout = localStorage.getItem('layouts');

    try {
      const json = JSON.parse(layout);

      if (json[path]) {
        // Give time for things to initialize? Won't work without the timeout.
        setTimeout(() => {
          setLayouts({
            lg: json[path].lg,
          });
        }, 1000);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

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
      <div className="m-3 mb-32">
        <div className="mx-3">
          <LayoutManager path={path} />
        </div>
        <ResponsiveGridLayout
          className="layout"
          breakpoints={{
            lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0,
          }}
          cols={{
            lg: 12, md: 12, sm: 2, xs: 2, xxs: 2,
          }}
          layouts={layouts}
          margin={[12, 12]}
          draggableHandle=".dragHandle"
          draggableCancel=".preventDragHandle"
          rowHeight={20}
        >
          {
            layouts !== null
              && layouts.lg !== null
              ? layouts.lg.map((layout) => {
                if (layout && layout.i && layout.component && layout.component.name) {
                  return (
                    <div key={layout.i} className="shadow overflow-x-auto" style={{ backgroundColor: '#fbfbfb' }}>
                      <AsyncComponent
                        component={layout.component.name}
                        props={layout.component.props}
                      />
                    </div>
                  );
                }
              }) : null
          }
        </ResponsiveGridLayout>
      </div>
    </Context.Provider>
  );
}

Neutron1.propTypes = {
  path: PropTypes.string.isRequired,
};

export default Neutron1;
