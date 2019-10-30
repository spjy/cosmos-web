import moment from 'moment-timezone';

import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import DashboardManager from '../pages/DashboardManager';

const routes = [
  {
    name: 'COSMOS Web',
    icon: 'global',
    path: '/',
    component: Home,
  },
  {
    name: 'Satellites',
    icon: 'rocket',
    path: '/satellite/:id',
    component: Dashboard,
    props: {
      socketType: 'live',
      defaultLayout: {
        lg: [
          {
            i: 'satellite-default-a',
            x: 0,
            y: 0,
            w: 4,
            h: 7,
            component: {
              name: 'Status',
            },
          },
          {
            i: 'satellite-default-b',
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
            i: 'satellite-default-c',
            x: 8,
            y: 0,
            w: 4,
            h: 7,
            component: {
              name: 'Clock',
            },
          },
          {
            i: 'satellite-default-d',
            x: 0,
            y: 1,
            w: 12,
            h: 10,
            component: {
              name: 'Commands',
            },
          },
          {
            i: 'satellite-default-e',
            x: 0,
            y: 2,
            w: 6,
            h: 21,
            component: {
              name: 'Globe',
              props: {
                name: 'Orbit',
                dataKey: 'node_loc_pos_eci',
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
                overlays: [
                  {
                    markerColor: 'RED',
                    geoJson: {
                      type: 'Polygon',
                      coordinates: [
                        [[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]],
                      ],
                    },
                  },
                ],
              },
            },
          },
          {
            i: 'satellite-default-f',
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
            i: 'satellite-default-g',
            x: 0,
            y: 3,
            w: 12,
            h: 18,
            component: {
              name: 'Chart',
              props: {
                name: 'Temperature',
                XDataKey: 'utc',
                processXDataKey: x => moment.unix((((x + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DDTHH:mm:ss'),
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
            i: 'satellite-default-h',
            x: 0,
            y: 4,
            w: 12,
            h: 18,
            component: {
              name: 'Chart',
              props: {
                name: 'Voltage',
                XDataKey: 'utc',
                processXDataKey: x => moment.unix((((x + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DDTHH:mm:ss'),
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
            i: 'satellite-default-i',
            x: 0,
            y: 5,
            w: 12,
            h: 18,
            component: {
              name: 'Chart',
              props: {
                name: 'Amperage',
                XDataKey: 'utc',
                processXDataKey: x => moment.unix((((x + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DDTHH:mm:ss'),
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
            i: 'satellite-default-j',
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
      },
    },
    children: [
      {
        name: 'neutron1',
        path: '/neutron1',
        icon: 'qrcode',
        defaultLayout: {
          lg: [
            {
              i: 'satellite-neutron1-a',
              x: 0,
              y: 0,
              w: 4,
              h: 7,
              component: {
                name: 'Status',
              },
            },
            {
              i: 'satellite-neutron1-b',
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
              i: 'satellite-neutron1-c',
              x: 8,
              y: 0,
              w: 4,
              h: 7,
              component: {
                name: 'Clock',
              },
            },
            {
              i: 'satellite-neutron1-d',
              x: 0,
              y: 1,
              w: 12,
              h: 10,
              component: {
                name: 'Commands',
              },
            },
            {
              i: 'satellite-neutron1-e',
              x: 0,
              y: 2,
              w: 6,
              h: 21,
              component: {
                name: 'Globe',
                props: {
                  name: 'Orbit',
                  dataKey: 'node_loc_pos_eci',
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
                  overlays: [
                    {
                      color: 'CRIMSON',
                      geoJson: {
                        type: 'Polygon',
                        coordinates: [
                          [[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]],
                        ],
                      },
                    },
                  ],
                },
              },
            },
            {
              i: 'satellite-neutron1-f',
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
              i: 'satellite-neutron1-g',
              x: 0,
              y: 3,
              w: 12,
              h: 18,
              component: {
                name: 'Chart',
                props: {
                  name: 'Temperature',
                  XDataKey: 'utc',
                  processXDataKey: x => moment.unix((((x + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DDTHH:mm:ss'),
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
              i: 'satellite-neutron1-h',
              x: 0,
              y: 4,
              w: 12,
              h: 18,
              component: {
                name: 'Chart',
                props: {
                  name: 'Voltage',
                  XDataKey: 'utc',
                  processXDataKey: x => moment.unix((((x + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DDTHH:mm:ss'),
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
              i: 'satellite-neutron1-i',
              x: 0,
              y: 5,
              w: 12,
              h: 18,
              component: {
                name: 'Chart',
                props: {
                  name: 'Amperage',
                  XDataKey: 'utc',
                  processXDataKey: x => moment.unix((((x + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DDTHH:mm:ss'),
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
              i: 'satellite-neutron1-j',
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
            {
              i: 'satellite-neutron1-k',
              x: 0,
              y: 6,
              w: 12,
              h: 19,
              component: {
                name: 'ThreeD',
                props: {
                  name: 'Attitude',
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
          ],
        },
      },
      {
        name: 'hyti',
        path: '/hyti',
        icon: 'camera',
        defaultLayout: {
          lg: [
            {
              i: 'satellite-hyti-a',
              x: 0,
              y: 0,
              w: 4,
              h: 7,
              component: {
                name: 'Status',
              },
            },
            {
              i: 'satellite-hyti-bb',
              x: 4,
              y: 0,
              w: 4,
              h: 7,
              component: {
                name: 'DisplayValue',
                props: {
                  name: 'Unibap CPU',
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
              i: 'satellite-hyti-c',
              x: 8,
              y: 0,
              w: 4,
              h: 7,
              component: {
                name: 'Clock',
              },
            },
            {
              i: 'satellite-hyti-d',
              x: 0,
              y: 1,
              w: 12,
              h: 10,
              component: {
                name: 'Commands',
              },
            },
            {
              i: 'satellite-hyti-e',
              x: 0,
              y: 2,
              w: 6,
              h: 21,
              component: {
                name: 'Globe',
                props: {
                  name: 'Orbit',
                  dataKey: 'node_loc_pos_eci',
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
              i: 'satellite-hyti-f',
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
              i: 'satellite-hyti-g',
              x: 0,
              y: 3,
              w: 12,
              h: 18,
              component: {
                name: 'Chart',
                props: {
                  name: 'Temperature',
                  XDataKey: 'utc',
                  processXDataKey: x => moment.unix((((x + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DDTHH:mm:ss'),
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
              i: 'satellite-hyti-h',
              x: 0,
              y: 4,
              w: 12,
              h: 18,
              component: {
                name: 'Chart',
                props: {
                  name: 'Voltage',
                  XDataKey: 'utc',
                  processXDataKey: x => moment.unix((((x + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DDTHH:mm:ss'),
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
              i: 'satellite-hyti-i',
              x: 0,
              y: 5,
              w: 12,
              h: 18,
              component: {
                name: 'Chart',
                props: {
                  name: 'Amperage',
                  XDataKey: 'utc',
                  processXDataKey: x => moment.unix((((x + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DDTHH:mm:ss'),
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
              i: 'satellite-hyti-j',
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
        },
      },
    ],
  },
  {
    name: 'Ground Stations',
    icon: 'wifi',
    path: '/gs/:id',
    component: Dashboard,
    props: {
      socketType: 'gs',
      defaultLayout: {
        lg: [
          {
            i: 'gs-default-a',
            x: 0,
            y: 0,
            w: 4,
            h: 7,
            component: {
              name: 'Status',
            },
          },
          {
            i: 'gs-default-b',
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
            i: 'gs-default-c',
            x: 8,
            y: 0,
            w: 4,
            h: 7,
            component: {
              name: 'Clock',
            },
          },
        ],
      },
    },
    children: [
      {
        name: 'KCC',
        path: '/kcc',
        icon: 'cloud',
        defaultLayout: {
          lg: [
            {
              i: 'gs-masdr-a',
              x: 0,
              y: 0,
              w: 6,
              h: 6,
              component: {
                name: 'DisplayValue',
                props: {
                  name: 'Uplink',
                  displayValues: [
                    {
                      name: 'Base Frequency',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'device_txr_freq_000',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                    {
                      name: 'Doppler Frequency',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'dopplerTx',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                    {
                      name: 'Doppler Offset',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'TxFrequency',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                  ],
                },
              },
            },
            {
              i: 'gs-masdr-aa',
              x: 6,
              y: 0,
              w: 6,
              h: 6,
              component: {
                name: 'DisplayValue',
                props: {
                  name: 'Downlink',
                  displayValues: [
                    {
                      name: 'Base Frequency',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'device_rxr_freq_000',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                    {
                      name: 'Doppler Frequency',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'dopplerRx',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                    {
                      name: 'Doppler Offset',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'RxFrequency',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                  ],
                },
              },
            },
            {
              i: 'gs-masdr-b',
              x: 6,
              y: 1,
              w: 6,
              h: 6,
              component: {
                name: 'Macro',
              },
            },
            {
              i: 'gs-masdr-c',
              x: 0,
              y: 1,
              w: 6,
              h: 6,
              component: {
                name: 'Clock',
              },
            },
            {
              i: 'gs-masdr-d',
              x: 0,
              y: 2,
              w: 12,
              h: 10,
              component: {
                name: 'MASDRCommands',
              },
            },
            {
              i: 'gs-masdr-e',
              x: 0,
              y: 3,
              w: 12,
              h: 14,
              component: {
                name: 'SetValues',
                props: {
                  name: 'Set Values',
                  node: 'masdr',
                  proc: 'nordiasoft',
                  values: {
                    AX25Framer: [
                      'DESTINATION_CALL_SIGN',
                      'SOURCE_CALL_SIGN',
                    ],
                    Descrambler: [
                      'DESCRAMBLER_PROPERTIES:LENGTH',
                      'DESCRAMBLER_PROPERTIES:MASK',
                      'DESCRAMBLER_PROPERTIES:SEED',
                    ],
                    GmskDemodulator: [
                      'bandwidth',
                      'samplesPerSymbol',
                      'symbolsDelay',
                    ],
                    GmskModulator: [
                      'bandwidth',
                      'samplesPerSymbol',
                      'symbolsDelay',
                    ],
                    FirKaiserFilterRx: [
                      'cutoffFrequency',
                      'samplingFrequency',
                      'stopBandAttenuation',
                      'transitionBand',
                    ],
                    FirKaiserFilterTx: [
                      'cutoffFrequency',
                      'samplingFrequency',
                      'stopBandAttenuation',
                      'transitionBand',
                    ],
                    HDLCEncoder: [
                      'HDLC_ENCODER_PROPERTIES:PREAMBLE_LENGTH',
                      'HDLC_ENCODER_PROPERTIES:POSTAMBLE_LENGTH',
                      'HDLC_ENCODER_PROPERTIES:WAVEFORM',
                    ],
                    MultiStageArbResamplerRx: [
                      'resamplingRate',
                      'stopBandAttentuation',
                    ],
                    MultiStageArbResamplerTx: [
                      'resamplingRate',
                      'stopBandAttentuation',
                    ],
                    NcoMixerRx: [
                      'dopplerFrequency',
                      'offsetFrequency',
                      'samplingFrequency',
                    ],
                    NcoMixerTx: [
                      'dopplerFrequency',
                      'offsetFrequency',
                      'samplingFrequency',
                    ],
                    ParseAX25new: [
                      'PARSEAX25_PROPERTIES:RXWAVEFORM',
                    ],
                    RepackBits: [
                      'REPACK_BITS_PROPERTIES:BITS_PER_INPUT_BYTE',
                      'REPACK_BITS_PROPERTIES:BITS_PER_OUTPUT_BYTE',
                      'REPACK_BITS_PROPERTIES:ENDIANNESS',
                    ],
                    UnpackBits: [
                      'REPACK_BITS_PROPERTIES:BITS_PER_INPUT_BYTE',
                      'REPACK_BITS_PROPERTIES:BITS_PER_OUTPUT_BYTE',
                      'REPACK_BITS_PROPERTIES:ENDIANNESS',
                    ],
                    UnpackBits2: [
                      'REPACK_BITS_PROPERTIES:BITS_PER_INPUT_BYTE',
                      'REPACK_BITS_PROPERTIES:BITS_PER_OUTPUT_BYTE',
                      'REPACK_BITS_PROPERTIES:ENDIANNESS',
                    ],
                    USRP_UHD_Device: [
                      'RF_MODE',
                      'TX_CENTER_FREQUENCY',
                      'TX_HARDWARE_SAMPLE_RATE',
                      'TX_GAIN',
                      'TX_ANTENNA',
                      'RX_BUFFER_SIZE',
                      'RX_CENTER_FREQUENCY',
                      'RX_HARDWARE_SAMPLE_RATE',
                      'RX_GAIN',
                      'RX_ANTENNA',
                    ],
                    USRP_Device_Rx: [
                      'RF_MODE',
                      'TX_CENTER_FREQUENCY',
                      'TX_HARDWARE_SAMPLE_RATE',
                      'TX_GAIN',
                      'TX_ANTENNA',
                      'RX_BUFFER_SIZE',
                      'RX_CENTER_FREQUENCY',
                      'RX_HARDWARE_SAMPLE_RATE',
                      'RX_GAIN',
                      'RX_ANTENNA',
                    ],
                    USRP_Device_Tx: [
                      'RF_MODE',
                      'TX_CENTER_FREQUENCY',
                      'TX_HARDWARE_SAMPLE_RATE',
                      'TX_GAIN',
                      'TX_ANTENNA',
                      'RX_BUFFER_SIZE',
                      'RX_CENTER_FREQUENCY',
                      'RX_HARDWARE_SAMPLE_RATE',
                      'RX_GAIN',
                      'RX_ANTENNA',
                    ],
                  },
                },
              },
            },
            {
              i: 'gs-masdr-f',
              x: 0,
              y: 4,
              w: 12,
              h: 7,
              component: {
                name: 'Activity',
                props: {
                },
              },
            },
            {
              i: 'gs-masdr-g',
              x: 0,
              y: 5,
              w: 12,
              h: 38,
              component: {
                name: 'Globe',
                props: {
                  name: 'Orbit',
                  dataKey: 'target_loc_pos_eci',
                  coordinateSystem: 'geodetic',
                  orbits: [
                    {
                      name: 'MASDR',
                      modelFileName: 'cubesat1.glb',
                      nodeProcess: 'masdr:nordiasoft',
                      live: true,
                      position: [21.289373, 157.917480, 350000.0],
                      geodetic: {
                        latitude: 10,
                        longitude: 10,
                      },
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
          ],
        },
        defaultLayoutSimple: {
          lg: [
            {
              i: 'gs-simple-mc3-a',
              x: 0,
              y: 0,
              w: 6,
              h: 6,
              component: {
                name: 'DisplayValue',
                props: {
                  name: 'Uplink',
                  displayValues: [
                    {
                      name: 'Base Frequency',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'device_txr_freq_000',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                    {
                      name: 'Doppler Frequency',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'dopplerTx',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                    {
                      name: 'Doppler Offset',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'TxFrequency',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                  ],
                },
              },
            },
            {
              i: 'gs-simple-mc3-aa',
              x: 6,
              y: 0,
              w: 6,
              h: 6,
              component: {
                name: 'DisplayValue',
                props: {
                  name: 'Downlink',
                  displayValues: [
                    {
                      name: 'Base Frequency',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'device_rxr_freq_000',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                    {
                      name: 'Doppler Frequency',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'dopplerRx',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                    {
                      name: 'Doppler Offset',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'RxFrequency',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                  ],
                },
              },
            },
            {
              i: 'gs-simple-mc3-c',
              x: 0,
              y: 1,
              w: 6,
              h: 6,
              component: {
                name: 'Clock',
              },
            },
            {
              i: 'gs-simple-mc3-f',
              x: 0,
              y: 4,
              w: 12,
              h: 7,
              component: {
                name: 'Activity',
                props: {
                },
              },
            },
            {
              i: 'gs-simple-mc3-g',
              x: 0,
              y: 5,
              w: 12,
              h: 38,
              component: {
                name: 'Globe',
                props: {
                  name: 'Orbit',
                  dataKey: 'target_loc_pos_eci',
                  coordinateSystem: 'geodetic',
                  orbits: [
                    {
                      name: 'MASDR',
                      modelFileName: 'cubesat1.glb',
                      nodeProcess: 'masdr:nordiasoft',
                      live: true,
                      position: [21.289373, 157.917480, 350000.0],
                      geodetic: {
                        latitude: 10,
                        longitude: 10,
                      },
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
          ],
        },
      },
      {
        name: 'MC3',
        path: '/mc3',
        icon: 'cloud',
        defaultLayout: {
          lg: [
            {
              i: 'gs-mc3-a',
              x: 0,
              y: 0,
              w: 6,
              h: 6,
              component: {
                name: 'DisplayValue',
                props: {
                  name: 'Uplink',
                  displayValues: [
                    {
                      name: 'Base Frequency',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'device_txr_freq_000',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                    {
                      name: 'Doppler Frequency',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'dopplerTx',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                    {
                      name: 'Doppler Offset',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'TxFrequency',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                  ],
                },
              },
            },
            {
              i: 'gs-mc3-aa',
              x: 6,
              y: 0,
              w: 6,
              h: 6,
              component: {
                name: 'DisplayValue',
                props: {
                  name: 'Downlink',
                  displayValues: [
                    {
                      name: 'Base Frequency',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'device_rxr_freq_000',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                    {
                      name: 'Doppler Frequency',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'dopplerRx',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                    {
                      name: 'Doppler Offset',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'RxFrequency',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                  ],
                },
              },
            },
            {
              i: 'gs-mc3-bb',
              x: 0,
              y: 1,
              w: 12,
              h: 10,
              component: {
                name: 'Sequence',
                props: {
                  sequences: [
                    {
                      button: 'Get Values',
                      sequence: [
                        'beagle1 eps get_tlm_12v',
                        'beagle1 eps get_tlm_vbat',
                        'beagle1 eps mjd',
                      ],
                    },
                    {
                      button: 'Initialize Nordiasoft',
                      sequence: [
                        'masdr nordiasoft initialize',
                        'masdr nordiasoft app_install ~/runtime_propcube_loopback/PropCubeWaveform',
                        'masdr nordiasoft list_applications',
                        'masdr nordiasoft app_launch PropCubeWaveform',
                        'masdr nordiasoft app_start PropCubeWaveform',
                      ],
                    },
                    {
                      button: 'Shutdown Nordiasoft',
                      sequence: [
                        'masdr nordiasoft app_stop PropCubeWaveform',
                        'masdr nordiasoft app_uninstall PropCubeWaveform',
                        'masdr nordiasoft app_shutdown PropCubeWaveform',
                      ],
                    },
                  ],
                },
              },
            },
            {
              i: 'gs-mc3-bbb',
              x: 0,
              y: 2,
              w: 12,
              h: 20,
              component: {
                name: 'Chart',
                props: {
                  name: 'Satellite Pass',
                  XDataKey: 'utc',
                  processXDataKey: x => moment.unix((((x + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DDTHH:mm:ss'),
                  plots: [
                    {
                      r: [5, 4, 3, 2, 1, 0.5, 0, 5],
                      theta: [90, 80, 70, 60, 50, 40, 0, 180],
                      mode: 'markers+lines',
                      type: 'scatterpolar',
                      marker: {
                        color: 'red',
                      },
                      name: '1',
                      YDataKey: 'predicted_path',
                      processYDataKey: y => y - 273.15,
                      nodeProcess: 'beagle1:propagator',
                      live: true,
                    },
                  ],
                },
              },
            },
            {
              i: 'gs-mc3-b',
              x: 6,
              y: 3,
              w: 6,
              h: 6,
              component: {
                name: 'Macro',
              },
            },
            {
              i: 'gs-mc3-c',
              x: 0,
              y: 4,
              w: 6,
              h: 6,
              component: {
                name: 'Clock',
              },
            },
            {
              i: 'gs-mc3-d',
              x: 0,
              y: 4,
              w: 12,
              h: 10,
              component: {
                name: 'MASDRCommands',
              },
            },
            {
              i: 'gs-mc3-e',
              x: 0,
              y: 5,
              w: 12,
              h: 14,
              component: {
                name: 'SetValues',
                props: {
                  name: 'Set Values',
                  node: 'masdr',
                  proc: 'nordiasoft',
                  values: {
                    AX25Framer: [
                      'DESTINATION_CALL_SIGN',
                      'SOURCE_CALL_SIGN',
                    ],
                    Descrambler: [
                      'DESCRAMBLER_PROPERTIES:LENGTH',
                      'DESCRAMBLER_PROPERTIES:MASK',
                      'DESCRAMBLER_PROPERTIES:SEED',
                    ],
                    GmskDemodulator: [
                      'bandwidth',
                      'samplesPerSymbol',
                      'symbolsDelay',
                    ],
                    GmskModulator: [
                      'bandwidth',
                      'samplesPerSymbol',
                      'symbolsDelay',
                    ],
                    FirKaiserFilterRx: [
                      'cutoffFrequency',
                      'samplingFrequency',
                      'stopBandAttenuation',
                      'transitionBand',
                    ],
                    FirKaiserFilterTx: [
                      'cutoffFrequency',
                      'samplingFrequency',
                      'stopBandAttenuation',
                      'transitionBand',
                    ],
                    HDLCEncoder: [
                      'HDLC_ENCODER_PROPERTIES:PREAMBLE_LENGTH',
                      'HDLC_ENCODER_PROPERTIES:POSTAMBLE_LENGTH',
                      'HDLC_ENCODER_PROPERTIES:WAVEFORM',
                    ],
                    MultiStageArbResamplerRx: [
                      'centerFrequency',
                      'cutoffFrequency',
                      'delay',
                      'resamplingRate',
                      'stopBandAttenuation',
                    ],
                    MultiStageArbResamplerTx: [
                      'centerFrequency',
                      'cutoffFrequency',
                      'delay',
                      'resamplingRate',
                      'stopBandAttenuation',
                    ],
                    NcoMixerRx: [
                      'dopplerFrequency',
                      'offsetFrequency',
                      'samplingFrequency',
                    ],
                    NcoMixerTx: [
                      'dopplerFrequency',
                      'offsetFrequency',
                      'samplingFrequency',
                    ],
                    ParseAX25new: [
                      'PARSEAX25_PROPERTIES:RXWAVEFORM',
                    ],
                    RepackBits: [
                      'REPACK_BITS_PROPERTIES:BITS_PER_INPUT_BYTE',
                      'REPACK_BITS_PROPERTIES:BITS_PER_OUTPUT_BYTE',
                      'REPACK_BITS_PROPERTIES:ENDIANNESS',
                    ],
                    UnpackBits: [
                      'REPACK_BITS_PROPERTIES:BITS_PER_INPUT_BYTE',
                      'REPACK_BITS_PROPERTIES:BITS_PER_OUTPUT_BYTE',
                      'REPACK_BITS_PROPERTIES:ENDIANNESS',
                    ],
                    UnpackBits2: [
                      'REPACK_BITS_PROPERTIES:BITS_PER_INPUT_BYTE',
                      'REPACK_BITS_PROPERTIES:BITS_PER_OUTPUT_BYTE',
                      'REPACK_BITS_PROPERTIES:ENDIANNESS',
                    ],
                    USRP_UHD_Device: [
                      'RF_MODE',
                      'TX_CENTER_FREQUENCY',
                      'TX_HARDWARE_SAMPLE_RATE',
                      'TX_GAIN',
                      'TX_ANTENNA',
                      'RX_BUFFER_SIZE',
                      'RX_CENTER_FREQUENCY',
                      'RX_HARDWARE_SAMPLE_RATE',
                      'RX_GAIN',
                      'RX_ANTENNA',
                    ],
                    USRP_Device_Rx: [
                      'RF_MODE',
                      'TX_CENTER_FREQUENCY',
                      'TX_HARDWARE_SAMPLE_RATE',
                      'TX_GAIN',
                      'TX_ANTENNA',
                      'RX_BUFFER_SIZE',
                      'RX_CENTER_FREQUENCY',
                      'RX_HARDWARE_SAMPLE_RATE',
                      'RX_GAIN',
                      'RX_ANTENNA',
                    ],
                    USRP_Device_Tx: [
                      'RF_MODE',
                      'TX_CENTER_FREQUENCY',
                      'TX_HARDWARE_SAMPLE_RATE',
                      'TX_GAIN',
                      'TX_ANTENNA',
                      'RX_BUFFER_SIZE',
                      'RX_CENTER_FREQUENCY',
                      'RX_HARDWARE_SAMPLE_RATE',
                      'RX_GAIN',
                      'RX_ANTENNA',
                    ],
                  },
                },
              },
            },
            {
              i: 'gs-mc3-f',
              x: 0,
              y: 6,
              w: 12,
              h: 7,
              component: {
                name: 'Activity',
                props: {
                },
              },
            },
            {
              i: 'gs-mc3-g',
              x: 0,
              y: 7,
              w: 12,
              h: 38,
              component: {
                name: 'Globe',
                props: {
                  name: 'Orbit',
                  dataKey: 'target_loc_pos_eci',
                  coordinateSystem: 'geodetic',
                  orbits: [
                    {
                      name: 'MASDR',
                      modelFileName: 'cubesat1.glb',
                      nodeProcess: 'masdr:nordiasoft',
                      live: true,
                      position: [21.289373, 157.917480, 350000.0],
                      geodetic: {
                        latitude: 10,
                        longitude: 10,
                      },
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
          ],
        },
        defaultLayoutSimple: {
          lg: [
            {
              i: 'gs-mc3-a',
              x: 0,
              y: 0,
              w: 6,
              h: 6,
              component: {
                name: 'DisplayValue',
                props: {
                  name: 'Uplink',
                  displayValues: [
                    {
                      name: 'Base Frequency',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'device_txr_freq_000',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                    {
                      name: 'Doppler Frequency',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'dopplerTx',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                    {
                      name: 'Doppler Offset',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'TxFrequency',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                  ],
                },
              },
            },
            {
              i: 'gs-mc3-aa',
              x: 6,
              y: 0,
              w: 6,
              h: 6,
              component: {
                name: 'DisplayValue',
                props: {
                  name: 'Downlink',
                  displayValues: [
                    {
                      name: 'Base Frequency',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'device_rxr_freq_000',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                    {
                      name: 'Doppler Frequency',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'dopplerRx',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                    {
                      name: 'Doppler Offset',
                      nodeProcess: 'masdr:nordiasoft',
                      dataKey: 'RxFrequency',
                      unit: 'Hz',
                      processDataKey: x => x.toFixed(7),
                    },
                  ],
                },
              },
            },
            {
              i: 'gs-mc3-c',
              x: 0,
              y: 1,
              w: 6,
              h: 6,
              component: {
                name: 'Clock',
              },
            },
            {
              i: 'gs-mc3-f',
              x: 6,
              y: 1,
              w: 6,
              h: 6,
              component: {
                name: 'Activity',
                props: {
                },
              },
            },
            {
              i: 'gs-mc3-bb',
              x: 0,
              y: 2,
              w: 12,
              h: 7,
              component: {
                name: 'Sequence',
              },
            },
            {
              i: 'gs-mc3-bbb',
              x: 0,
              y: 3,
              w: 12,
              h: 20,
              component: {
                name: 'Chart',
                props: {
                  name: 'Satellite Pass',
                  XDataKey: 'utc',
                  processXDataKey: x => moment.unix((((x + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DDTHH:mm:ss'),
                  plots: [
                    {
                      r: [5, 4, 3, 2, 1, 0.5, 0, 5],
                      theta: [90, 80, 70, 60, 50, 40, 0, 180],
                      mode: 'markers+lines',
                      type: 'scatterpolar',
                      marker: {
                        color: 'red',
                      },
                      name: '1',
                      YDataKey: 'predicted_path',
                      processYDataKey: y => y - 273.15,
                      nodeProcess: 'beagle1:propagator',
                      live: true,
                    },
                  ],
                },
              },
            },
            {
              i: 'gs-mc3-g',
              x: 0,
              y: 5,
              w: 12,
              h: 38,
              component: {
                name: 'Globe',
                props: {
                  name: 'Orbit',
                  dataKey: 'target_loc_pos_eci',
                  coordinateSystem: 'geodetic',
                  orbits: [
                    {
                      name: 'MASDR',
                      modelFileName: 'cubesat1.glb',
                      nodeProcess: 'masdr:nordiasoft',
                      live: true,
                      position: [21.289373, 157.917480, 350000.0],
                      geodetic: {
                        latitude: 10,
                        longitude: 10,
                      },
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
          ],
        },
      },
    ],
  },
  {
    name: 'Dashboard Manager',
    icon: 'setting',
    path: '/dashboards',
    component: DashboardManager,
    rightAlign: true,
  },
];

export default routes;
